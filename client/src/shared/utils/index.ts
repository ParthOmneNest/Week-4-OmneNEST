export function formatPrice(price: number): string {
  return "₹" + price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 10_000_000) return (volume / 10_000_000).toFixed(2) + " Cr";
  if (volume >= 100_000)    return (volume / 100_000).toFixed(2) + " L";
  return volume.toLocaleString("en-IN");
}

export function formatMarketCap(mc?: number): string {
  if (!mc) return "—";
  if (mc >= 100_000) return "₹" + (mc / 100_000).toFixed(2) + " L Cr";
  return "₹" + mc.toLocaleString("en-IN") + " Cr";
}

export function getColor(value: number): string {
  return value >= 0 ? "#00C87C" : "#FF4D4D";
}

export function getBgColor(value: number): string {
  return value >= 0 ? "rgba(0,200,124,0.12)" : "rgba(255,77,77,0.12)";
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
