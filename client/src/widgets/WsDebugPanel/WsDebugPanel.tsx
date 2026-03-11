 
import { memo } from "react";
import { useLiveMarketStore } from "@/store/liveMarket.store";
import type { WsLifecycleEvent } from "@/services/websocket";
 
function eventLabel(event: WsLifecycleEvent): { label: string; color: string } {
  switch (event.kind) {
    case "CONNECTED":           return { label: "✓ CONNECTED",         color: "var(--green)" };
    case "DISCONNECTED":        return { label: `✗ DISCONNECTED (${event.code})`, color: "var(--red)" };
    case "RECONNECTING":        return { label: `↺ RECONNECTING #${event.attempt} (+${(event.delayMs/1000).toFixed(1)}s)`, color: "var(--gold)" };
    case "MAX_RETRIES_REACHED": return { label: "✗ MAX RETRIES",        color: "var(--red)" };
    case "ERROR":               return { label: "⚠ ERROR",              color: "var(--red)" };
    case "PING_SENT":           return { label: "→ PING",               color: "var(--text-muted)" };
    case "PONG_RECEIVED":       return { label: "← PONG",               color: "var(--gold)" };
    case "PONG_TIMEOUT":        return { label: "⏱ PONG TIMEOUT",       color: "var(--red)" };
    case "SUBSCRIBED":          return { label: `✓ SUBSCRIBED (${event.tokens.length} exchange(s))`, color: "var(--blue)" };
    // default:                    return { label: event.kind, color: "var(--text-muted)" };
       default: {
      // Cast to 'any' for the fallback to prevent the 'never' error
      const unknownEvent = event as any;
      return { 
        label: unknownEvent?.kind || "UNKNOWN", 
        color: "var(--text-muted)" 
      };
    }
  }
}
 
export const WsDebugPanel = memo(function WsDebugPanel() {
  const status       = useLiveMarketStore((s) => s.status);
  const pingCount    = useLiveMarketStore((s) => s.pingCount);
  const pongCount    = useLiveMarketStore((s) => s.pongCount);
  const lastPongAt   = useLiveMarketStore((s) => s.lastPongAt);
  const lifecycleLog = useLiveMarketStore((s) => s.lifecycleLog);
  const retryAttempt = useLiveMarketStore((s) => s.retryAttempt);
 
  return (
    <div style={{
      width: "300px",
      background: "var(--bg-panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 14px",
        borderBottom: "1px solid var(--border)",
        fontSize: "9px",
        letterSpacing: "1.5px",
        color: "var(--text-muted)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>WS DEBUG</span>
        <span style={{
          color: status === "OPEN" ? "var(--green)" : "var(--red)",
          fontWeight: "700",
        }}>
          {status}
        </span>
      </div>
 
      {/* Stats row */}
      <div style={{
        display: "flex",
        gap: "0",
        borderBottom: "1px solid var(--border)",
      }}>
        {[
          { label: "PINGS",   value: pingCount },
          { label: "PONGS",   value: pongCount },
          { label: "RETRIES", value: retryAttempt },
          { label: "LAST PONG", value: lastPongAt
            ? new Date(lastPongAt).toLocaleTimeString("en-IN", { hour12: false })
            : "—" },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: 1,
            padding: "8px 10px",
            borderRight: "1px solid var(--border)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", marginBottom: "2px", letterSpacing: "1px" }}>
              {stat.label}
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: "700" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
 
      {/* Event log */}
      <div className="scroll-y" style={{ flex: 1, maxHeight: "260px" }}>
        {lifecycleLog.length === 0 ? (
          <p style={{ color: "var(--text-muted)", padding: "20px", textAlign: "center" }}>
            No events yet
          </p>
        ) : (
          lifecycleLog.map(({ ts, event }, i) => {
            const { label, color } = eventLabel(event);
            return (
              <div key={i} style={{
                display: "flex",
                gap: "8px",
                padding: "4px 12px",
                borderBottom: "1px solid var(--border-subtle)",
                alignItems: "center",
              }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0, fontSize: "9px" }}>
                  {new Date(ts).toLocaleTimeString("en-IN", { hour12: false })}
                </span>
                <span style={{ color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
 
