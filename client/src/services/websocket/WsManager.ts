import {
  WS_BASE_URL,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  RECONNECT_MAX_ATTEMPTS,
  getReconnectDelay,
  DEFAULT_SUBSCRIPTIONS,
  PING_PAYLOAD,
} from "./config";
 
import {
  parseRawFrame,
  isPong,
  isErrorFrame,
  extractTicks,
  normaliseTick,
} from "./messageParser";
 
import type {
  WsSubscribeMessage,
  TickHandler,
  LifecycleHandler,
  WsLifecycleEvent,
} from "./types";
 
// ─── Internal state type ──────────────────────────────────────────────────────
 
type WsState = "IDLE" | "CONNECTING" | "OPEN" | "RECONNECTING" | "CLOSED";
 
// ─── WsManager ────────────────────────────────────────────────────────────────
 
export class WsManager {
  // ── Public observable state ──────────────────────────────────────────────
  public state: WsState = "IDLE";
 
  // ── Private fields ───────────────────────────────────────────────────────
  private ws: WebSocket | null = null;
  private clientCode = "";
 
  /** Subscriptions that should always be re-sent after reconnect */
  private pendingSubscriptions: WsSubscribeMessage["tokenList"] = [...DEFAULT_SUBSCRIPTIONS];
 
  // Listeners
  private tickListeners   = new Set<TickHandler>();
  private lifecycleListeners = new Set<LifecycleHandler>();
 
  // Timers
  private pingTimer:       ReturnType<typeof setInterval>  | null = null;
  private pongTimer:       ReturnType<typeof setTimeout>   | null = null;
  private reconnectTimer:  ReturnType<typeof setTimeout>   | null = null;
 
  // Reconnect state
  private retryAttempt = 0;
  private intentionalClose = false;   // true when user calls .disconnect()
 
  // ─── Singleton ─────────────────────────────────────────────────────────────
  private static _instance: WsManager | null = null;
  static getInstance(): WsManager {
    if (!WsManager._instance) WsManager._instance = new WsManager();
    return WsManager._instance;
  }
  private constructor() {}
 
  // ─── Public API ────────────────────────────────────────────────────────────
 
  /**
   * Initiate (or re-initiate) the connection.
   * @param clientCode  NSE client code, e.g. "AMITH1"
   */
  connect(clientCode: string): void {
    this.clientCode      = clientCode;
    this.intentionalClose = false;
    this.retryAttempt    = 0;
    this._openSocket();
  }
 
  /** Gracefully close the connection and stop all reconnect attempts. */
  disconnect(): void {
    this.intentionalClose = true;
    this._clearTimers();
    if (this.ws) {
      this.ws.onclose = null; // prevent auto-reconnect
      this.ws.close(1000, "Client disconnected");
      this.ws = null;
    }
    this.state = "CLOSED";
    this._emit({ kind: "DISCONNECTED", code: 1000, reason: "Client disconnected" });
  }
 
  /**
   * Subscribe to one or more token lists.
   * If the socket is open the message is sent immediately; otherwise the
   * subscription is queued and replayed on the next successful connect.
   */
  subscribe(tokenList: WsSubscribeMessage["tokenList"]): void {
    // Merge into the persistent pending list (dedup by exchange+token)
    tokenList.forEach((tl) => {
      const existing = this.pendingSubscriptions.find((p) => p.exchange === tl.exchange);
      if (existing) {
        existing.tokens = Array.from(new Set([...existing.tokens, ...tl.tokens]));
      } else {
        this.pendingSubscriptions.push({ ...tl });
      }
    });
 
    // Send immediately if connected
    if (this.state === "OPEN") {
      this._sendSubscription({ action: "SUBSCRIBE", mode: "LTP", tokenList });
      this._emit({ kind: "SUBSCRIBED", tokens: tokenList });
    }
  }
 
  /**
   * Unsubscribe from specific tokens.
   */
  unsubscribe(tokenList: WsSubscribeMessage["tokenList"]): void {
    if (this.state === "OPEN") {
      this._sendMessage({ action: "UNSUBSCRIBE", mode: "LTP", tokenList });
    }
    // Remove from pending subscriptions
    tokenList.forEach((tl) => {
      const existing = this.pendingSubscriptions.find((p) => p.exchange === tl.exchange);
      if (existing) {
        existing.tokens = existing.tokens.filter((t) => !tl.tokens.includes(t));
      }
    });
  }
 
  // ── Listener registration ─────────────────────────────────────────────────
 
  onTick(handler: TickHandler): () => void {
    this.tickListeners.add(handler);
    return () => this.tickListeners.delete(handler);
  }
 
  onLifecycle(handler: LifecycleHandler): () => void {
    this.lifecycleListeners.add(handler);
    return () => this.lifecycleListeners.delete(handler);
  }
 
  // ─── Private: connection lifecycle ────────────────────────────────────────
 
  private _openSocket(): void {
    if (!this.clientCode) {
      console.error("[WsManager] clientCode is required before connecting.");
      return;
    }
 
    this.state = this.retryAttempt === 0 ? "CONNECTING" : "RECONNECTING";
 
    const url = `${WS_BASE_URL}?clientCode=${encodeURIComponent(this.clientCode)}`;
    console.info(`[WsManager] Opening ${url} (attempt ${this.retryAttempt + 1})`);
 
    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error("[WsManager] WebSocket constructor threw:", err);
      this._scheduleReconnect();
      return;
    }
 
    this.ws.onopen    = this._handleOpen.bind(this);
    this.ws.onmessage = this._handleMessage.bind(this);
    this.ws.onclose   = this._handleClose.bind(this);
    this.ws.onerror   = this._handleError.bind(this);
  }
 
  private _handleOpen(): void {
    this.state        = "OPEN";
    this.retryAttempt = 0;
 
    console.info("[WsManager] Connected ✓");
    this._emit({ kind: "CONNECTED" });
 
    // Re-subscribe to everything that was requested before / after last connect
    if (this.pendingSubscriptions.length > 0) {
      this._sendSubscription({
        action: "SUBSCRIBE",
        mode: "LTP",
        tokenList: this.pendingSubscriptions,
      });
      this._emit({ kind: "SUBSCRIBED", tokens: this.pendingSubscriptions });
    }
 
    this._startHeartbeat();
  }
 
  private _handleMessage(event: MessageEvent): void {
    const data = typeof event.data === "string" ? event.data : "";
    const frame = parseRawFrame(data);
    if (!frame) return;
 
    // ── PONG ────────────────────────────────────────────────────────────────
    if (isPong(frame)) {
      this._clearPongTimer();
      this._emit({ kind: "PONG_RECEIVED" });
      return;
    }
 
    // ── Server error frame ──────────────────────────────────────────────────
    if (isErrorFrame(frame)) {
      console.error("[WsManager] Server error:", frame.error);
      this._emit({ kind: "ERROR", error: new Event(frame.error) });
      return;
    }
 
    // ── Market tick(s) ──────────────────────────────────────────────────────
    const rawTicks = extractTicks(frame);
    if (rawTicks.length > 0) {
      rawTicks.forEach((raw) => {
        const tick = normaliseTick(raw);
        this.tickListeners.forEach((fn) => {
          try { fn(tick); } catch (e) { console.error("[WsManager] tickHandler threw:", e); }
        });
      });
    }
  }
 
  private _handleClose(event: CloseEvent): void {
    this.state = "RECONNECTING";
    this._clearHeartbeat();
 
    const { code, reason } = event;
    console.warn(`[WsManager] Closed (code=${code}, reason="${reason}")`);
    this._emit({ kind: "DISCONNECTED", code, reason: reason || "" });
 
    if (!this.intentionalClose) {
      this._scheduleReconnect();
    }
  }
 
  private _handleError(event: Event): void {
    console.error("[WsManager] Socket error:", event);
    this._emit({ kind: "ERROR", error: event });
    // onclose fires automatically after onerror – no manual reconnect here
  }
 
  // ─── Private: reconnection ────────────────────────────────────────────────
 
  private _scheduleReconnect(): void {
    if (this.retryAttempt >= RECONNECT_MAX_ATTEMPTS) {
      console.error("[WsManager] Max reconnect attempts reached. Giving up.");
      this.state = "CLOSED";
      this._emit({ kind: "MAX_RETRIES_REACHED" });
      return;
    }
 
    const delay = getReconnectDelay(this.retryAttempt);
    this.retryAttempt += 1;
 
    console.info(`[WsManager] Reconnecting in ${(delay / 1000).toFixed(1)} s (attempt ${this.retryAttempt})`);
    this._emit({ kind: "RECONNECTING", attempt: this.retryAttempt, delayMs: delay });
 
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._openSocket();
    }, delay);
  }
 
  // ─── Private: heartbeat ──────────────────────────────────────────────────
 
  private _startHeartbeat(): void {
    this._clearHeartbeat();
    this.pingTimer = setInterval(() => this._sendPing(), PING_INTERVAL_MS);
  }
 
  private _sendPing(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
 
    this.ws.send(PING_PAYLOAD);
    this._emit({ kind: "PING_SENT" });
 
    // Arm pong timeout watchdog
    this.pongTimer = setTimeout(() => {
      console.warn("[WsManager] PONG timeout — forcing reconnect (zombie socket)");
      this._emit({ kind: "PONG_TIMEOUT" });
      this.ws?.close(4000, "PONG timeout");
    }, PONG_TIMEOUT_MS);
  }
 
  private _clearPongTimer(): void {
    if (this.pongTimer) { clearTimeout(this.pongTimer); this.pongTimer = null; }
  }
 
  private _clearHeartbeat(): void {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
    this._clearPongTimer();
  }
 
  // ─── Private: helpers ────────────────────────────────────────────────────
 
  private _clearTimers(): void {
    this._clearHeartbeat();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  }
 
  private _sendMessage(payload: object): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (e) {
      console.error("[WsManager] send failed:", e);
    }
  }
 
  private _sendSubscription(msg: WsSubscribeMessage): void {
    this._sendMessage(msg);
  }
 
  private _emit(event: WsLifecycleEvent): void {
    this.lifecycleListeners.forEach((fn) => {
      try { fn(event); } catch (e) { console.error("[WsManager] lifecycleHandler threw:", e); }
    });
  }
}
 
/** App-wide singleton — import this instead of `new WsManager()` */
export const wsManager = WsManager.getInstance();
 
