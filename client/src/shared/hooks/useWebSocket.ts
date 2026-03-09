import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store";
import { parseMessage } from "@/services/websocket/messageParser";
import {
  getReconnectDelay,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  SERVER_URL,
} from "@/services/websocket/reconnectStrategy";

export function useWebSocket() {
  const wsRef         = useRef<WebSocket | null>(null);
  const retryRef      = useRef(0);
  const retryTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStock, setOrderBook, setConnected, addEvent } = useMarketStore.getState();

  function stopHeartbeat() {
    if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
    if (pongTimer.current) { clearTimeout(pongTimer.current);  pongTimer.current = null; }
  }

  function startHeartbeat(ws: WebSocket) {
    stopHeartbeat();
    pingTimer.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type: "PING", ts: Date.now() }));
      addEvent("PING sent", "ping");
      pongTimer.current = setTimeout(() => {
        console.warn("[WS] PONG timeout — closing zombie socket");
        ws.close();
      }, PONG_TIMEOUT_MS);
    }, PING_INTERVAL_MS);
  }

  function connect() {
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
      addEvent("Connected to " + SERVER_URL, "connect");
      startHeartbeat(ws);
    };

    ws.onmessage = (event: MessageEvent) => {
      const msg = parseMessage(event.data as string);
      if (!msg) return;

      if (msg.type === "PONG") {
        if (pongTimer.current) { clearTimeout(pongTimer.current); pongTimer.current = null; }
        addEvent("PONG received", "ping");
        return;
      }
      if (msg.type === "STOCK_UPDATE") {
        setStock(msg.stock);
        addEvent(`${msg.stock.symbol} → ₹${msg.stock.price.toFixed(2)}`, "price");
        return;
      }
      if (msg.type === "ORDER_BOOK") {
        setOrderBook({ symbol: msg.symbol, bids: msg.bids, asks: msg.asks });
        return;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      stopHeartbeat();
      const delay = getReconnectDelay(retryRef.current);
      retryRef.current += 1;
      addEvent(`Disconnected. Retrying in ${(delay / 1000).toFixed(1)}s…`, "disconnect");
      retryTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => addEvent("WebSocket error", "error");
  }

  useEffect(() => {
    connect();
    return () => {
      stopHeartbeat();
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose send for components that need to subscribe to order books
  function send(data: object) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { send };
}
