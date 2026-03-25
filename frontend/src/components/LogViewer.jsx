export default function LogViewer({ content, flaggedLines }) {
  if (!content) return null
  const lines = content.split("\n")
  const flagged = new Set(flaggedLines || [])
  return (
    <div style={{ background: "var(--bg-void)", borderRadius: 4, overflow: "hidden",
      border: "1px solid var(--border)" }}>
      <div style={{ padding: "6px 14px", background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
          letterSpacing: "0.15em" }}>// LOG STREAM</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {lines.length} LINES · <span style={{ color: "var(--accent-red)" }}>{flagged.size} FLAGGED</span>
        </span>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {lines.map((line, i) => {
          const ln = i + 1
          const isFlagged = flagged.has(ln)
          return (
            <div key={i} style={{
              display: "flex",
              background: isFlagged ? "rgba(255,34,68,0.07)" : "transparent",
              borderLeft: `2px solid ${isFlagged ? "var(--accent-red)" : "transparent"}`,
              padding: "2px 0",
            }}>
              <span style={{ minWidth: 44, paddingLeft: 10, color: "var(--text-dim)",
                userSelect: "none", flexShrink: 0, fontSize: 10 }}>{ln}</span>
              <span style={{ paddingLeft: 10, paddingRight: 14,
                color: isFlagged ? "#ff8899" : "#3a6a7a",
                wordBreak: "break-all", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {line || " "}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
