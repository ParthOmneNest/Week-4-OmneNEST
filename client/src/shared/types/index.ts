// ── Stock ────────────────────────────────────────────────────────────────────
export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
};

// ── Order book ───────────────────────────────────────────────────────────────
export type OrderBookLevel = { price: number; qty: number };
export type OrderBook = {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

// ── Server messages ──────────────────────────────────────────────────────────
export type ServerMessage =
  | { type: "HELLO"; message: string }
  | { type: "STOCK_UPDATE"; stock: Stock }
  | { type: "ORDER_BOOK"; symbol: string; bids: OrderBookLevel[]; asks: OrderBookLevel[] }
  | { type: "PONG"; ts: number };

// ── Portfolio ────────────────────────────────────────────────────────────────
export type Holding = {
  symbol: string;
  qty: number;
  avgBuyPrice: number;
};

// ── Watchlist ────────────────────────────────────────────────────────────────
export type WatchlistItem = { symbol: string };

// ── Event log ────────────────────────────────────────────────────────────────
export type EventKind = "connect" | "disconnect" | "price" | "ping" | "error" | "order";
export type EventLogEntry = {
  id: number;
  msg: string;
  kind: EventKind;
  time: string;
};
