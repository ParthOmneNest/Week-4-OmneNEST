export const WS_BASE_URL = "wss://preprodapisix.omnenest.com/v1/ws";
 
/** Heartbeat interval – server expects a ping this often */
export const PING_INTERVAL_MS = 25_000;
 
/** If no PONG arrives within this window, consider the socket a zombie */
export const PONG_TIMEOUT_MS = 7_000;
 
/** Reconnection back-off settings */
export const RECONNECT_BASE_DELAY_MS = 1_000;   // first retry after 1 s
export const RECONNECT_MAX_DELAY_MS  = 30_000;  // cap at 30 s
export const RECONNECT_MAX_ATTEMPTS  = 10;       // give up after 10 tries
export const RECONNECT_JITTER_MS     = 500;      // random jitter to avoid thundering herd- when multiple clients disconnect and all try to connect at once
 
/**
 * Compute the next back-off delay.
 *   attempt 0 → ~1 000 ms
 *   attempt 1 → ~2 000 ms
 *   attempt 2 → ~4 000 ms  … capped at RECONNECT_MAX_DELAY_MS
 */
export function getReconnectDelay(attempt: number): number {
  const base   = Math.pow(2, attempt) * RECONNECT_BASE_DELAY_MS;
  const jitter = Math.random() * RECONNECT_JITTER_MS;
  return Math.min(base + jitter, RECONNECT_MAX_DELAY_MS);
}
 
/** Default subscriptions sent on every fresh connection */
export const DEFAULT_SUBSCRIPTIONS = [
  {
    exchange: "NSE_CM" as const,
    tokens: ["Nifty 50"], // HDFCBANK token example; extend as needed
  },
];
 
/** Ping payload – lightweight JSON ping recognised by OmneNest */
export const PING_PAYLOAD = JSON.stringify({ action: "PING" });
