import { useEffect } from "react";
import { useUIStore } from "@/store";

export function NotificationStack() {
  const notifications     = useUIStore((s) => s.notifications);
  const dismissNotification = useUIStore((s) => s.dismissNotification);

  useEffect(() => {
    notifications.forEach((n) => {
      const t = setTimeout(() => dismissNotification(n.id), 3500);
      return () => clearTimeout(t);
    });
  }, [notifications, dismissNotification]);

  if (!notifications.length) return null;

  const colorMap = { success: "var(--green)", error: "var(--red)", info: "var(--blue)" };

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      display: "flex", flexDirection: "column", gap: "8px",
      zIndex: 1000, pointerEvents: "none",
    }}>
      {notifications.map((n) => (
        <div key={n.id} style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${colorMap[n.kind]}40`,
          borderLeft: `3px solid ${colorMap[n.kind]}`,
          borderRadius: "var(--radius)",
          padding: "10px 14px",
          fontSize: "12px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          pointerEvents: "auto",
          maxWidth: "300px",
          animation: "fadeSlideIn 0.2s ease",
        }}>
          {n.msg}
        </div>
      ))}
    </div>
  );
}
