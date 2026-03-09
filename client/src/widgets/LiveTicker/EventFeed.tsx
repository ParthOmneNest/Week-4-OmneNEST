import { memo } from "react";
import { useMarketStore } from "@/store";
import type { EventKind } from "@/shared/types";

function kindColor(k: EventKind): string {
  switch (k) {
    case "connect":    return "var(--green)";
    case "disconnect": return "var(--red)";
    case "price":      return "var(--blue)";
    case "ping":       return "var(--gold)";
    case "error":      return "var(--red)";
    case "order":      return "#b388ff";
    default:           return "var(--text-muted)";
  }
}

function kindIcon(k: EventKind): string {
  switch (k) {
    case "connect":    return "✓";
    case "disconnect": return "✗";
    case "price":      return "▲";
    case "ping":       return "○";
    case "error":      return "⚠";
    case "order":      return "◆";
    default:           return "·";
  }
}

export const EventFeed = memo(function EventFeed() {
  const eventLog  = useMarketStore((s) => s.eventLog);
  const tickCount = useMarketStore((s) => s.tickCount);

  return (
    <div style={{
      width: "220px", borderLeft: "1px solid var(--border)",
      background: "var(--bg-panel)", display: "flex",
      flexDirection: "column", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 12px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: "var(--text-muted)" }}>
          WS EVENTS
        </span>
        <span style={{
          fontSize: "10px", color: "var(--green)",
          background: "var(--green-bg)", padding: "1px 7px", borderRadius: "10px",
          fontFamily: "var(--font-mono)", fontWeight: "600",
        }}>
          {tickCount.toLocaleString()}
        </span>
      </div>

      {/* Feed */}
      <div className="scroll-y" style={{ flex: 1 }}>
        {eventLog.length === 0 ? (
          <p style={{
            color: "var(--text-muted)", fontSize: "10px",
            textAlign: "center", padding: "40px 12px",
            fontFamily: "var(--font-mono)",
          }}>
            Waiting for events…
          </p>
        ) : (
          eventLog.map((e) => (
            <div key={e.id} style={{
              display: "flex", gap: "7px", alignItems: "flex-start",
              padding: "4px 12px", borderBottom: "1px solid var(--border-subtle)",
              fontSize: "10px", fontFamily: "var(--font-mono)",
            }}>
              <span style={{ color: kindColor(e.kind), flexShrink: 0, width: "12px", lineHeight: "1.5" }}>
                {kindIcon(e.kind)}
              </span>
              <span style={{ color: "var(--text-muted)", flexShrink: 0, lineHeight: "1.5" }}>
                {e.time}
              </span>
              <span style={{
                color: "var(--text-secondary)", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "1.5",
              }}>
                {e.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
