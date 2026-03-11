export { wsManager, WsManager } from "./WsManager";
export type {
  WsSubscribeMessage,
  MarketTick,
  RawTickFrame,
  TickHandler,
  LifecycleHandler,
  WsLifecycleEvent,
} from "./types";
export {
  WS_BASE_URL,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  RECONNECT_MAX_ATTEMPTS,
  DEFAULT_SUBSCRIPTIONS,
  getReconnectDelay,
} from "./config";
export {
  parseRawFrame,
  isPong,
  isErrorFrame,
  extractTicks,
  normaliseTick,
} from "./messageParser";
 
