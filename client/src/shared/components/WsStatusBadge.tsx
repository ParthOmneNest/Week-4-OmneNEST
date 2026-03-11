import { memo } from "react";
import { useLiveMarketStore, type WsConnectionStatus } from "@/store/liveMarket.store";
 
const STATUS_CONFIG: Record<
  WsConnectionStatus,
  { label: string; color: string; glow: string; pulse: boolean }
> = {
  IDLE:               { label: "IDLE",         color: "var(--text-muted)", glow: "none",             pulse: false },
  CONNECTING:         { label: "CONNECTING…",  color: "var(--gold)",       glow: "0 0 6px var(--gold)", pulse: true  },
  OPEN:               { label: "LIVE",          color: "var(--green)",      glow: "0 0 6px var(--green)", pulse: true },
  RECONNECTING:       { label: "RECONNECTING…", color: "var(--gold)",      glow: "0 0 6px var(--gold)", pulse: true  },
  CLOSED:             { label: "OFFLINE",       color: "var(--red)",        glow: "none",             pulse: false },
  MAX_RETRIES_REACHED:{ label: "FAILED",        color: "var(--red)",        glow: "none",             pulse: false },
};
 
interface Props {
  showRetry?: boolean;
  onRetry?: () => void;
}
 
export const WsStatusBadge = memo(function WsStatusBadge({ showRetry, onRetry }: Props) {
  const status       = useLiveMarketStore((s) => s.status);
  const retryAttempt = useLiveMarketStore((s) => s.retryAttempt);
  const cfg          = STATUS_CONFIG[status];
 
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* Dot */}
      <div
        className={cfg.pulse ? "pulse" : ""}
        style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: cfg.color,
          boxShadow: cfg.glow,
          flexShrink: 0,
        }}
      />
 
      {/* Label */}
      <span style={{
        fontSize: "10px", fontWeight: "600",
        letterSpacing: "1px", color: cfg.color,
        fontFamily: "var(--font-mono)",
      }}>
        {cfg.label}
        {status === "RECONNECTING" && retryAttempt > 0 && (
          <span style={{ opacity: 0.7 }}> #{retryAttempt}</span>
        )}
      </span>
 
      {/* Retry button for MAX_RETRIES_REACHED */}
      {showRetry && status === "MAX_RETRIES_REACHED" && onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: "none",
            border: "1px solid var(--red)",
            color: "var(--red)",
            borderRadius: "var(--radius-sm)",
            padding: "1px 8px",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            cursor: "pointer",
            letterSpacing: "0.5px",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--red)";
            (e.currentTarget as HTMLElement).style.color = "#000";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.color = "var(--red)";
          }}
        >
          RETRY
        </button>
      )}
    </div>
  );
});
 
