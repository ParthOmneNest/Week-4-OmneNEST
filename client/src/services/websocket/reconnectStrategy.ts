// Exponential backoff with jitter — prevents thundering herd
export function getReconnectDelay(attempt: number): number {
  const base = Math.pow(2, attempt) * 1000;   // 1s, 2s, 4s, 8s…
  const jitter = Math.random() * 500;          // up to 0.5s extra randomness
  return Math.min(base + jitter, 30_000);      // cap at 30s
}

export const PING_INTERVAL_MS  = 25_000;
export const PONG_TIMEOUT_MS   = 5_000;
export const SERVER_URL        = "wss://preprodapisix.omnenest.com/v1/ws?clientCode=AMITH1";
