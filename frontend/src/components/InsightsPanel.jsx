import RiskBadge from "./RiskBadge"

export default function InsightsPanel({ result }) {
  if (!result) return null
  const {
    insights = [], attack_vectors = [], compliance_flags = [],
    remediation = {}, severity_breakdown = {}, threat_score_explanation = ""
  } = result

  const panelStyle = {
    background: "var(--bg-surface)", border: "1px solid var(--border)",
    borderRadius: 4, padding: 18, marginBottom: 16
  }
  const labelStyle = {
    fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
    letterSpacing: "0.18em", marginBottom: 12, display: "block"
  }

  return (
    <div style={{ animation: "fadeInUp 0.4s ease both" }}>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div style={panelStyle}>
          <span style={labelStyle}>// AI_INSIGHTS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                background: "var(--bg-elevated)", borderRadius: 3,
                padding: "10px 12px", border: "1px solid var(--border)",
                borderLeft: "2px solid var(--accent-cyan)"
              }}>
                <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
                  fontSize: 10, flexShrink: 0, marginTop: 2 }}>
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <span style={{ color: "var(--text-primary)", fontSize: 13,
                  fontFamily: "var(--font-ui)", lineHeight: 1.6 }}>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Severity Breakdown */}
      {Object.values(severity_breakdown).some(v => v > 0) && (
        <div style={panelStyle}>
          <span style={labelStyle}>// SEVERITY_MATRIX</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { key: "critical", color: "var(--accent-red)" },
              { key: "high", color: "var(--accent-amber)" },
              { key: "medium", color: "var(--accent-cyan)" },
              { key: "low", color: "var(--accent-green)" },
            ].map(({ key, color }) => (
              <div key={key} style={{
                background: "var(--bg-elevated)", border: `1px solid ${color}22`,
                borderRadius: 3, padding: "12px 8px", textAlign: "center"
              }}>
                <div style={{ fontSize: 26, fontFamily: "var(--font-display)",
                  color, fontWeight: 900, textShadow: `0 0 10px ${color}` }}>
                  {severity_breakdown[key] || 0}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                  marginTop: 4, textTransform: "uppercase" }}>{key}</div>
              </div>
            ))}
          </div>
          {threat_score_explanation && (
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)",
              fontFamily: "var(--font-mono)", borderTop: "1px solid var(--border)",
              paddingTop: 10 }}>▸ {threat_score_explanation}</div>
          )}
        </div>
      )}

      {/* Attack Vectors */}
      {attack_vectors.length > 0 && (
        <div style={panelStyle}>
          <span style={labelStyle}>// ATTACK_VECTORS</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {attack_vectors.map((v, i) => (
              <span key={i} style={{
                background: "rgba(255,34,68,0.08)", color: "#ff6677",
                border: "1px solid rgba(255,34,68,0.25)", borderRadius: 3,
                padding: "4px 12px", fontSize: 11, fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em"
              }}>⚡ {v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Flags */}
      {compliance_flags.length > 0 && (
        <div style={panelStyle}>
          <span style={labelStyle}>// COMPLIANCE_FLAGS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {compliance_flags.map((flag, i) => (
              <div key={i} style={{
                background: "rgba(255,170,0,0.06)", border: "1px solid rgba(255,170,0,0.2)",
                borderRadius: 3, padding: "9px 12px",
                fontSize: 12, color: "#ffcc66", fontFamily: "var(--font-ui)",
                display: "flex", gap: 8, alignItems: "flex-start"
              }}>
                <span style={{ color: "var(--accent-amber)", flexShrink: 0 }}>▲</span>
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediation */}
      {Object.keys(remediation).length > 0 && (
        <div style={panelStyle}>
          <span style={labelStyle}>// REMEDIATION_GUIDE</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(remediation).map(([type, fix], i) => (
              <div key={i} style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderLeft: "2px solid var(--accent-green)",
                borderRadius: 3, padding: "10px 12px"
              }}>
                <div style={{ fontSize: 10, color: "var(--accent-green)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                  marginBottom: 6 }}>FIX :: {type.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "var(--text-primary)",
                  fontFamily: "var(--font-ui)", lineHeight: 1.6 }}>{fix}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
