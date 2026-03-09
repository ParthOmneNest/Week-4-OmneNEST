import { useMemo } from "react";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useMarketStore } from "@/store";
import { formatPrice, formatPercent, formatChange, getColor } from "@/shared/utils";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";

export function PortfolioPage() {
  const holdings      = usePortfolioStore((s) => s.holdings);
  const stocks        = useMarketStore((s) => s.stocks);
  const priceHistory  = useMarketStore((s) => s.priceHistory);

  const enriched = useMemo(() =>
    holdings.map((h) => {
      const stock    = stocks[h.symbol];
      const ltp      = stock?.price ?? h.avgBuyPrice;
      const invested = h.qty * h.avgBuyPrice;
      const current  = h.qty * ltp;
      const pnl      = current - invested;
      const pnlPct   = ((ltp - h.avgBuyPrice) / h.avgBuyPrice) * 100;
      return { ...h, ltp, invested, current, pnl, pnlPct, stock };
    }),
  [holdings, stocks]);

  const totals = useMemo(() => ({
    invested: enriched.reduce((a, h) => a + h.invested, 0),
    current:  enriched.reduce((a, h) => a + h.current,  0),
  }), [enriched]);

  const totalPnl = totals.current - totals.invested;
  const totalPct = totals.invested > 0 ? ((totalPnl / totals.invested) * 100) : 0;
  const isPos    = totalPnl >= 0;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "INVESTED", value: formatPrice(totals.invested), color: "var(--text-primary)" },
          { label: "CURRENT VALUE", value: formatPrice(totals.current), color: "var(--text-primary)" },
          { label: "TOTAL P&L", value: `${formatChange(totalPnl)} (${formatPercent(totalPct)})`, color: getColor(totalPnl) },
        ].map((c) => (
          <div key={c.label} style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "20px",
          }}>
            <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: "var(--text-muted)", marginBottom: "8px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: c.color, fontFamily: "var(--font-mono)" }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Holdings table */}
      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--border)",
          fontSize: "9px", letterSpacing: "1.5px", color: "var(--text-muted)",
        }}>
          HOLDINGS ({enriched.length})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["STOCK", "QTY", "AVG COST", "LTP", "INVESTED", "CURRENT", "P&L", "TREND"].map((h) => (
                <th key={h} style={{
                  padding: "8px 20px", textAlign: h === "STOCK" ? "left" : "right",
                  fontSize: "9px", letterSpacing: "1px", color: "var(--text-muted)",
                  fontWeight: "700",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((h) => (
              <tr key={h.symbol} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{h.symbol}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{h.stock?.name}</div>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{h.qty}</td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{formatPrice(h.avgBuyPrice)}</td>
                <td style={{ padding: "12px 20px", textAlign: "right", fontWeight: "600", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{formatPrice(h.ltp)}</td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{formatPrice(h.invested)}</td>
                <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{formatPrice(h.current)}</td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <span className={`badge ${h.pnl >= 0 ? "badge-green" : "badge-red"}`}>
                    {formatChange(h.pnl)}
                  </span>
                  <div style={{ fontSize: "10px", color: getColor(h.pnlPct), marginTop: "2px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                    {formatPercent(h.pnlPct)}
                  </div>
                </td>
                <td style={{ padding: "8px 20px", textAlign: "right" }}>
                  <Sparkline prices={priceHistory[h.symbol] ?? []} isGreen={h.pnl >= 0} width={64} height={24} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
