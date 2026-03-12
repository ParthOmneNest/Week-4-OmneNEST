 
import { useEffect, useRef } from "react";
import { wsManager } from "@/services/websocket";
import { useLiveMarketStore } from "@/store/liveMarket.store";
 
interface Options {
  /** NSE client code – obtained from the JWT after login */
  clientCode: string;
  /**
   * Additional token lists to subscribe to beyond DEFAULT_SUBSCRIPTIONS.
   * Stable reference recommended (useMemo / constant).
   */
  extraSubscriptions?: Array<{
    exchange: "NSE_CM" | "BSE_CM" | "NSE_FO" | "BSE_FO" | "MCX_FO";
    tokens: string[];
  }>;
}
 
/**
 * useLiveMarketWs
 *
 * Usage:
 *   // In App.tsx (after authentication):
 *   useLiveMarketWs({ clientCode: "AMITH1" });
 */
export function useLiveMarketWs({ clientCode, extraSubscriptions }: Options): void {
  const handleTick      = useLiveMarketStore((s) => s.handleTick);
  const handleLifecycle = useLiveMarketStore((s) => s.handleLifecycle);
 
  // Keep a stable reference to the latest handlers so the effect doesn't re-run
  const tickRef      = useRef(handleTick);
  const lifecycleRef = useRef(handleLifecycle);
  tickRef.current      = handleTick;
  lifecycleRef.current = handleLifecycle;
 
  useEffect(() => {
    if (!clientCode) return;
 
    // Register listeners – returns unsubscribe functions
    const unsubTick  = wsManager.onTick((tick) =>{
      console.log("WS MANAGER RECEIVED TICK:", tick);
      tickRef.current(tick);
    }) 
    const unsubLifecycle = wsManager.onLifecycle((ev) => lifecycleRef.current(ev));
 
    // Subscribe to any extra tokens requested by this mount
    if (extraSubscriptions && extraSubscriptions.length > 0) {
      wsManager.subscribe(extraSubscriptions);
    }
 
    // Kick off the connection
    wsManager.connect(clientCode);
 
    return () => {
      unsubTick();
      unsubLifecycle();
      wsManager.disconnect();
    };
    // clientCode is the only dep that should trigger a full reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientCode]);
}
 

