import RiskBadge from "./RiskBadge"

export default function FindingsTable({ findings }) {
  if (!findings || findings.length === 0) return (
    <div style={{
      padding: "20px 16px", background: "rgba(0,255,136,0.04)",
      border: "1px solid rgba(0,255,136,0.2)", borderRadius: 4,
      color: "var(--accent-green)", fontFamily: "var(--font-mono)",
      fontSize: 13, letterSpacing: "0.08em", textAlign: "center"
    }}>
      ✓ NO THREATS DETECTED
    </div>
  )
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-mono)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["LINE", "TYPE", "RISK", "SNIPPET"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.15em",
                fontFamily: "var(--font-mono)", fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={i} style={{
              borderBottom: "1px solid rgba(13,37,53,0.8)",
              background: i % 2 === 0 ? "transparent" : "rgba(0,229,255,0.01)",
              animation: `fadeInUp 0.3s ease ${i * 0.04}s both`
            }}>
              <td style={{ padding: "8px 12px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                {String(f.line).padStart(4, "0")}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                {f.type?.toUpperCase()}
              </td>
              <td style={{ padding: "8px 12px" }}><RiskBadge level={f.risk} /></td>
              <td style={{ padding: "8px 12px", color: "var(--text-muted)",
                maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.snippet || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
