import { create } from "zustand";
import type { MarketTick, WsLifecycleEvent } from "@/services/websocket";
 
// ── State shape ───────────────────────────────────────────────────────────────
 
export type WsConnectionStatus =
  | "IDLE"
  | "CONNECTING"
  | "OPEN"
  | "RECONNECTING"
  | "CLOSED"
  | "MAX_RETRIES_REACHED";
 
export interface LiveMarketState {
  // Connection
  status: WsConnectionStatus;
  retryAttempt: number;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
 
  // Live ticks keyed by token
  ticks: Record<string, MarketTick>;
 
  // Price-history ring-buffer per token (last 60 prices)
  tickHistory: Record<string, number[]>;
 
  // Ping/pong stats
  pingCount: number;
  pongCount: number;
  lastPongAt: number | null;
 
  // Event log (last 100 lifecycle events)
  lifecycleLog: Array<{ ts: number; event: WsLifecycleEvent }>;
 
  // Actions
  handleTick: (tick: MarketTick) => void;
  handleLifecycle: (event: WsLifecycleEvent) => void;
  reset: () => void;
}
 
// ── History ring-buffer helper ────────────────────────────────────────────────
 
const HISTORY_SIZE = 60;
 
function appendHistory(existing: number[], price: number): number[] {
  const next = [...existing, price];
  return next.length > HISTORY_SIZE ? next.slice(next.length - HISTORY_SIZE) : next;
}
 
// ── Store ─────────────────────────────────────────────────────────────────────
 
const initialState: Omit<LiveMarketState, 'handleTick' | 'handleLifecycle' | 'reset'> = {
  status: "IDLE" as WsConnectionStatus,
  retryAttempt: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  ticks: {},
  tickHistory: {},
  pingCount: 0,
  pongCount: 0,
  lastPongAt: null,
  lifecycleLog: [],
};
 
export const useLiveMarketStore = create<LiveMarketState>((set) => ({
  ...initialState,
 
  handleTick: (tick: MarketTick) =>
    set((state) => ({
      ticks: { ...state.ticks, [tick.token]: tick },
      tickHistory: {
        ...state.tickHistory,
        [tick.token]: appendHistory(state.tickHistory[tick.token] ?? [], tick.ltp),
      },
    })),
 
  handleLifecycle: (event: WsLifecycleEvent) =>
    set((state) => {
      const now = Date.now();
 
      // Build updated log (cap at 100 entries)
      const lifecycleLog = [
        { ts: now, event },
        ...state.lifecycleLog,
      ].slice(0, 100);
 
      // Derive status & counters from lifecycle event
      switch (event.kind) {
        case "CONNECTED":
          return {
            lifecycleLog,
            status: "OPEN" as WsConnectionStatus,
            lastConnectedAt: now,
            retryAttempt: 0,
          };
        case "DISCONNECTED":
          return {
            lifecycleLog,
            status: "RECONNECTING" as WsConnectionStatus,
            lastDisconnectedAt: now,
          };
        case "RECONNECTING":
          return {
            lifecycleLog,
            status: "RECONNECTING" as WsConnectionStatus,
            retryAttempt: event.attempt,
          };
        case "MAX_RETRIES_REACHED":
          return {
            lifecycleLog,
            status: "MAX_RETRIES_REACHED" as WsConnectionStatus,
          };
        case "PING_SENT":
          return { lifecycleLog, pingCount: state.pingCount + 1 };
        case "PONG_RECEIVED":
          return {
            lifecycleLog,
            pongCount: state.pongCount + 1,
            lastPongAt: now,
          };
        default:
          return { lifecycleLog };
      }
    }),
 
  reset: () => set(initialState),
}));
 
