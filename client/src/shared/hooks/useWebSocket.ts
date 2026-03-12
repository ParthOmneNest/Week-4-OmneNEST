import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store";
import { 
  parseRawFrame, 
  extractTicks, 
  normaliseTick, 
  isPong 
} from "@/services/websocket/messageParser"; // ★ Use these helpers
import {
  getReconnectDelay,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  SERVER_URL,
} from "@/services/websocket/reconnectStrategy";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStock, setConnected, addEvent } = useMarketStore.getState();

  function stopHeartbeat() {
    if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
    if (pongTimer.current) { clearTimeout(pongTimer.current);  pongTimer.current = null; }
  }

  function startHeartbeat(ws: WebSocket) {
    stopHeartbeat();
    pingTimer.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      // ★ Change: Live server often expects "action" instead of "type"
      ws.send(JSON.stringify({ action: "PING" })); 
      addEvent("PING sent", "ping");
      
      pongTimer.current = setTimeout(() => {
        console.warn("[WS] PONG timeout — closing zombie socket");
        ws.close();
      }, PONG_TIMEOUT_MS);
    }, PING_INTERVAL_MS);
  }

  function connect() {
    // Ensure SERVER_URL is "wss://://omnenest.com" in your strategy file
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
      addEvent("Connected to Live Market", "connect");
      startHeartbeat(ws);

      // ★ NEW: You MUST send a SUBSCRIBE message to get data
      const subMsg = {
        action: "SUBSCRIBE",
        mode: "LTP",
        tokenList: [
          { exchange: "NSE_CM", tokens: ["11377", "3045"] } // Add your tokens here
        ]
      };
      ws.send(JSON.stringify(subMsg));
    };

    ws.onmessage = (event: MessageEvent) => {
      const frame = parseRawFrame(event.data as string);
      if (!frame) return;

      // 1. Handle PONG using your helper
      if (isPong(frame)) {
        if (pongTimer.current) { 
          clearTimeout(pongTimer.current); 
          pongTimer.current = null; 
        }
        addEvent("PONG received", "ping");
        return;
      }

      // 2. Extract and Map Live Ticks (Live data is usually an array)
      const rawTicks = extractTicks(frame);
      rawTicks.forEach((raw) => {
        const tick = normaliseTick(raw);
        
        // Convert live tick fields to the "stock" object your UI expects
        setStock({
          symbol: tick.token, 
          price: tick.ltp,
          change: tick.change,
          changePercent: tick.changePercent,
          volume: tick.volume,
          high: tick.high,
          low: tick.low
        } as any);
        
        addEvent(`${tick.token} → ₹${tick.ltp.toFixed(2)}`, "price");
      });
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
  }, []);

  function send(data: object) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { send };
}
