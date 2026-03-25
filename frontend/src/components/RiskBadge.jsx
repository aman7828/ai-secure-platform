export default function RiskBadge({ level }) {
  const cfg = {
    critical: { color: "#ff2244", bg: "rgba(255,34,68,0.12)", border: "rgba(255,34,68,0.4)", glyph: "◈" },
    high:     { color: "#ffaa00", bg: "rgba(255,170,0,0.12)", border: "rgba(255,170,0,0.4)", glyph: "◆" },
    medium:   { color: "#00e5ff", bg: "rgba(0,229,255,0.08)", border: "rgba(0,229,255,0.3)", glyph: "◇" },
    low:      { color: "#00ff88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.3)", glyph: "○" },
    safe:     { color: "#00ff88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.3)", glyph: "✓" },
    malicious:{ color: "#ff2244", bg: "rgba(255,34,68,0.15)", border: "rgba(255,34,68,0.5)", glyph: "⚠" },
  }
  const c = cfg[level?.toLowerCase()] || cfg.safe
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 3, padding: "3px 10px",
      fontSize: 11, fontFamily: "var(--font-mono)",
      fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase",
      boxShadow: `0 0 8px ${c.border}`,
    }}>
      <span style={{ fontSize: 9 }}>{c.glyph}</span>
      {level}
    </span>
  )
}
