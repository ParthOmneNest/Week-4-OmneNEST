import { memo } from "react";

type Props = {
  prices: number[];
  isGreen: boolean;
  width?: number;
  height?: number;
};

export const Sparkline = memo(function Sparkline({ prices, isGreen, width = 80, height = 30 }: Props) {
  if (prices.length < 2) return <svg width={width} height={height} />;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 2;

  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - pad * 2) - pad;
    return `${x},${y}`;
  });

  const color = isGreen ? "#00C87C" : "#FF4D4D";
  const fill  = isGreen ? "rgba(0,200,124,0.07)" : "rgba(255,77,77,0.07)";

  // Area fill path
  const areaPath = `M${pts.join(" L")} L${width},${height} L0,${height} Z`;
  const linePath = `M${pts.join(" L")}`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});
