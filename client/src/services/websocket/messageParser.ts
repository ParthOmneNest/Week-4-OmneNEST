
import type { RawTickFrame, MarketTick } from "./types";
export function parseRawFrame(data: string): unknown | null {
  try {
    return JSON.parse(data);
  } catch {
    console.warn("[WsParser] Malformed JSON, skipping frame:", data.slice(0, 120));
    return null;
  }
}
 
/**
 * Detect whether a parsed frame is a PONG response.
 * OmneNest sends: { "action": "PONG" }  or  { "type": "PONG" }
 */
export function isPong(frame: unknown): boolean {
  if (!frame || typeof frame !== "object") return false;
  const f = frame as Record<string, unknown>;
  return f["action"] === "PONG" || f["type"] === "PONG";
}
 
/**
 * Detect whether a parsed frame is an error message from the server.
 */
export function isErrorFrame(frame: unknown): frame is { error: string; code?: number } {
  if (!frame || typeof frame !== "object") return false;
  return "error" in (frame as object);
}

/**
 * Detect whether a parsed frame looks like a market-data tick.
 * OmneNest wraps ticks in: { "data": [...] }  OR  sends an array directly.
 */
export function extractTicks(frame: unknown): RawTickFrame[] {
  if (!frame || typeof frame !== "object") return [];
 
  // Shape: { "data": [...] }
  const f = frame as Record<string, unknown>;
  if (Array.isArray(f["data"])) {
    return f["data"] as RawTickFrame[];
  }
 
  // Shape: [...] — array of ticks at the root
  if (Array.isArray(frame)) {
    return frame as RawTickFrame[];
  }
 
  // Single tick object
  if (typeof f["token"] === "string" || typeof f["ltp"] === "number") {
    return [f as unknown as RawTickFrame];
  }
return [];}
export function normaliseTick(raw: RawTickFrame): MarketTick {
  const ltp    = raw.ltp ?? raw.indexValue ?? 0;
  const close  = raw.close ?? ltp;
  const change = raw.change ?? ltp - close;
  const changePct = raw.changePercent ?? raw.indexChangePercent
    ?? (close !== 0 ? (change / close) * 100 : 0);
 
  return {
    token:         raw.token       ?? "UNKNOWN",
    exchange:      raw.exchange    ?? "NSE_CM",
    ltp,
    volume:        raw.volume      ?? 0,
    bid:           raw.bid         ?? ltp,
    ask:           raw.ask         ?? ltp,
    open:          raw.open        ?? ltp,
    high:          raw.high        ?? ltp,
    low:           raw.low         ?? ltp,
    close,
    change:        parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePct.toFixed(2)),
    timestamp:     raw.timestamp   ?? Date.now(),
  };
}

