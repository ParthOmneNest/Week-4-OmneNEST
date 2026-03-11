
import { useEffect, useMemo } from "react";
import { wsManager } from "@/services/websocket";
import type { WsSubscribeMessage } from "@/services/websocket";
 
type Exchange = WsSubscribeMessage["tokenList"][number]["exchange"];
 
interface UseTokenSubscriptionOptions {
  exchange: Exchange;
  tokens: string[];
  mode?: WsSubscribeMessage["mode"];
  /** Skip subscribing while false – useful for conditional rendering */
  enabled?: boolean;
}
 
/**
 * Mount inside any feature component to subscribe to additional tokens.
 *
 * Usage:
 *   useTokenSubscription({ exchange: "NSE_CM", tokens: ["11377"] });
 */
export function useTokenSubscription({
  exchange,
  tokens,
  mode = "LTP",
  enabled = true,
}: UseTokenSubscriptionOptions): void {
  // Stable token list string so the effect doesn't thrash on every render
  const tokenKey = useMemo(() => tokens.slice().sort().join(","), [tokens]);
 
  useEffect(() => {
    if (!enabled || tokens.length === 0) return;
 
    const tokenList = [{ exchange, tokens }];
    wsManager.subscribe(tokenList);
 
    return () => {
      wsManager.unsubscribe(tokenList);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchange, tokenKey, mode, enabled]);
}
