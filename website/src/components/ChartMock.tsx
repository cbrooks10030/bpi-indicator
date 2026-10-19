// Stylized SVG mock of the indicator on a chart. Replace with a real
// screenshot by dropping an image at /public/chart.png and swapping this out.
export function ChartMock() {
  const candles = [
    { x: 20, o: 120, c: 90, h: 80, l: 130, up: true },
    { x: 44, o: 92, c: 70, h: 62, l: 100, up: true },
    { x: 68, o: 72, c: 96, h: 66, l: 104, up: false },
    { x: 92, o: 96, c: 74, h: 66, l: 108, up: true },
    { x: 116, o: 74, c: 52, h: 44, l: 84, up: true },
    { x: 140, o: 54, c: 78, h: 48, l: 88, up: false },
    { x: 164, o: 78, c: 60, h: 50, l: 92, up: true },
    { x: 188, o: 60, c: 40, h: 30, l: 70, up: true },
    { x: 212, o: 42, c: 66, h: 36, l: 76, up: false },
    { x: 236, o: 66, c: 48, h: 38, l: 80, up: true },
    { x: 260, o: 50, c: 34, h: 24, l: 62, up: true },
    { x: 284, o: 36, c: 58, h: 30, l: 68, up: false },
  ];
  return (
    <div className="relative rounded-2xl border border-line bg-[#0c0e14] p-3 card-shadow">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
        <span className="ml-3 font-mono text-xs text-white/40">NQ1! · 5m · BPI Indicator</span>
      </div>
      <svg viewBox="0 0 320 180" className="w-full rounded-lg bg-[#0c0e14]">
        {/* FVG zone */}
        <rect x="180" y="40" width="140" height="26" fill="#22d3a5" opacity="0.12" />
        <rect x="60" y="96" width="120" height="18" fill="#f59e0b" opacity="0.12" />
        {/* liquidity lines */}
        <line x1="0" y1="30" x2="320" y2="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <line x1="0" y1="132" x2="320" y2="132" stroke="#22d3a5" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        {/* candles */}
        {candles.map((k, i) => (
          <g key={i}>
            <line x1={k.x} y1={k.h} x2={k.x} y2={k.l} stroke={k.up ? "#22d3a5" : "#ef4444"} strokeWidth="1.4" />
            <rect
              x={k.x - 5}
              y={Math.min(k.o, k.c)}
              width="10"
              height={Math.max(4, Math.abs(k.c - k.o))}
              fill={k.up ? "#22d3a5" : "#ef4444"}
            />
          </g>
        ))}
        {/* labels */}
        <text x="184" y="38" fontSize="7" fill="#22d3a5" fontFamily="monospace">FVG</text>
        <text x="6" y="27" fontSize="7" fill="#ef4444" fontFamily="monospace">BSL</text>
        <text x="6" y="143" fontSize="7" fill="#22d3a5" fontFamily="monospace">SSL</text>
        <text x="250" y="24" fontSize="7" fill="#a78bfa" fontFamily="monospace">CISD ✓</text>
      </svg>
    </div>
  );
}
