export default function RiskGauge({ score, level }) {
  const max = 50
  const pct = Math.min((score / max) * 100, 100)
  const colors = {
    critical: "#ff2244", high: "#ffaa00",
    medium: "#00e5ff", low: "#00ff88", safe: "#00ff88"
  }
  const color = colors[level] || "#00e5ff"
  const r = 52, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ textAlign: "center", minWidth: 130 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        letterSpacing: "0.15em", marginBottom: 6 }}>THREAT SCORE</div>
      <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto" }}>
        <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0d2535" strokeWidth="8" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 28, fontFamily: "var(--font-display)", color, fontWeight: 900,
            textShadow: `0 0 12px ${color}` }}>{score}</span>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em" }}>/{max}+</span>
        </div>
      </div>
    </div>
  )
}
