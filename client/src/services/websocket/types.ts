export interface WsSubscribeMessage {
  action: "SUBSCRIBE" | "UNSUBSCRIBE";
  mode: "LTP" | "QUOTE" | "SNAP_QUOTE" | "INDEX" | "FULL";
  tokenList: Array<{
    exchange: "NSE_CM" | "BSE_CM" | "NSE_FO" | "BSE_FO" | "MCX_FO";
    tokens: string[];
  }>;
}
 
/** Raw tick frame that arrives from the OmneNest server */
export interface RawTickFrame {
  token: string;
  exchange: string;
  ltp?: number;
  ltq?: number;
  volume?: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  change?: number;
  changePercent?: number;
  timestamp?: number;
  // INDEX mode extras
  indexValue?: number;
  indexChange?: number;
  indexChangePercent?: number;
}
 
/** Normalised tick that the rest of the app consumes */
export interface MarketTick {
  token: string;
  exchange: string;
  ltp: number;
  volume: number;
  bid: number;
  ask: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  timestamp: number;
}
 
/** Internal lifecycle events emitted by the WsManager */
export type WsLifecycleEvent =
  | { kind: "CONNECTED" }
  | { kind: "DISCONNECTED"; code: number; reason: string }
  | { kind: "RECONNECTING"; attempt: number; delayMs: number }
  | { kind: "ERROR"; error: Event }
  | { kind: "PING_SENT" }
  | { kind: "PONG_RECEIVED" }
  | { kind: "PONG_TIMEOUT" }
  | { kind: "SUBSCRIBED"; tokens: WsSubscribeMessage["tokenList"] }
  | { kind: "MAX_RETRIES_REACHED" };
 
export type TickHandler = (tick: MarketTick) => void;
export type LifecycleHandler = (event: WsLifecycleEvent) => void;
 
