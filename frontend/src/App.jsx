import { useState, useEffect } from "react"
import { analyzeContent } from "./api"
import DropZone from "./components/DropZone"
import FindingsTable from "./components/FindingsTable"
import LogViewer from "./components/LogViewer"
import InsightsPanel from "./components/InsightsPanel"
import RiskBadge from "./components/RiskBadge"
import RiskGauge from "./components/RiskGauge"

const TABS = [
  { id: "text", label: "TEXT" },
  { id: "log",  label: "LOG" },
  { id: "file", label: "FILE" },
  { id: "sql",  label: "SQL" },
  { id: "chat", label: "CHAT" },
]

const PLACEHOLDERS = {
  text: "// paste text with potential sensitive data...\n\napi_key=sk-prod-abc123xyz\npassword=admin123\nemail=user@company.com",
  sql:  "-- paste SQL queries to scan...\n\nSELECT * FROM users WHERE id=1 OR 1=1--\nDROP TABLE users;",
  chat: "// paste chat logs or messages...\n\nUser: my token is eyJhbGc...\nAssistant: I see you shared credentials",
}

function Terminal({ lines }) {
  const [visible, setVisible] = useState([])
  useEffect(() => {
    setVisible([])
    lines.forEach((l, i) => {
      setTimeout(() => setVisible(p => [...p, l]), i * 60)
    })
  }, [lines.join("|")])
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11,
      color: "var(--text-muted)", lineHeight: 1.9 }}>
      {visible.map((l, i) => (
        <div key={i} style={{ opacity: 0, animation: "fadeInUp 0.2s ease forwards" }}>
          <span style={{ color: "var(--accent-cyan)" }}>▸ </span>{l}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState("text")
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mask, setMask] = useState(false)
  const [blockHigh, setBlockHigh] = useState(false)
  const [activeResultTab, setActiveResultTab] = useState("findings")
  const [termLines, setTermLines] = useState(["SYSTEM READY", "AWAITING INPUT..."])

  async function handleAnalyze() {
    setLoading(true); setError(""); setResult(null)
    setTermLines(["INITIALIZING SCAN ENGINE...", "LOADING DETECTION MODULES...", "RUNNING ANALYSIS..."])
    try {
      const data = await analyzeContent({
        inputType: tab, content,
        file: (tab === "log" || tab === "file") ? file : null,
        options: { mask, block_high_risk: blockHigh }
      })
      setResult(data)
      setActiveResultTab("findings")
      const lines = [
        `SCAN COMPLETE — ${data.findings?.length || 0} FINDINGS`,
        `RISK LEVEL: ${data.risk_level?.toUpperCase()}`,
        `CLASSIFICATION: ${data.classification || "SENSITIVE"}`,
        `ACTION: ${data.action?.toUpperCase()}`,
      ]
      if (data.attack_vectors?.length) lines.push(`VECTORS: ${data.attack_vectors.join(", ")}`)
      setTermLines(lines)
    } catch (e) {
      setError(e.response?.data?.error || e.message || "SCAN FAILED")
      setTermLines(["ERROR: CONNECTION REFUSED", "CHECK BACKEND STATUS"])
    }
    setLoading(false)
  }

  const card = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 4, padding: 18,
  }

  const resultTabs = [
    { id: "findings", label: "FINDINGS", count: result?.findings?.length },
    { id: "insights", label: "AI INTEL", count: result?.insights?.length },
    { id: "log", label: "LOG VIEW", show: result?.content_type === "log" },
  ].filter(t => t.show !== false)

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>

      {/* Header */}
      <div style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 32, height: 32, border: "1px solid var(--accent-cyan)",
            borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(0,229,255,0.2)" }}>
            <span style={{ color: "var(--accent-cyan)", fontSize: 16 }}>⬡</span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13,
              color: "var(--accent-cyan)", letterSpacing: "0.12em",
              textShadow: "0 0 10px rgba(0,229,255,0.4)", animation: "glitch 8s infinite" }}>
              AI//SECURE_PLATFORM
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)",
              fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
              GATEWAY · SCANNER · LOG_ANALYZER · RISK_ENGINE
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {["DJANGO 6.0", "CLAUDE AI", "REGEX ENGINE"].map(t => (
            <span key={t} style={{ fontSize: 10, color: "var(--text-muted)",
              fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
              <span style={{ color: "var(--accent-green)", marginRight: 5 }}>●</span>{t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px",
        display: "grid", gridTemplateColumns: "420px 1fr", gap: 20 }}>

        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Input type tabs */}
          <div style={card}>
            <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
              letterSpacing: "0.18em", marginBottom: 12 }}>// INPUT_TYPE</div>
            <div style={{ display: "flex", gap: 6 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setFile(null); setContent("") }}
                  style={{ flex: 1, padding: "7px 4px", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
                    borderRadius: 3, transition: "all 0.15s",
                    background: tab === t.id ? "var(--accent-cyan)" : "var(--bg-elevated)",
                    color: tab === t.id ? "#000" : "var(--text-muted)",
                    boxShadow: tab === t.id ? "0 0 12px rgba(0,229,255,0.3)" : "none",
                    fontWeight: tab === t.id ? 700 : 400,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div style={card}>
            <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
              letterSpacing: "0.18em", marginBottom: 12 }}>
              // {tab === "log" || tab === "file" ? "FILE_UPLOAD" : "DATA_INPUT"}
            </div>
            {tab === "log" || tab === "file" ? (
              <DropZone onFile={setFile} file={file} />
            ) : (
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={PLACEHOLDERS[tab] || PLACEHOLDERS.text}
                style={{
                  width: "100%", minHeight: 200, background: "var(--bg-void)",
                  border: "1px solid var(--border)", borderRadius: 3,
                  padding: "12px 14px", color: "var(--text-primary)",
                  fontSize: 12, fontFamily: "var(--font-mono)", resize: "vertical",
                  outline: "none", lineHeight: 1.7,
                  caretColor: "var(--accent-cyan)",
                  animation: "pulse-border 4s ease infinite",
                }} />
            )}
          </div>

          {/* Options */}
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
              letterSpacing: "0.18em" }}>// POLICY</span>
            {[["mask", mask, setMask, "MASK DATA"],
              ["block", blockHigh, setBlockHigh, "BLOCK HIGH-RISK"]].map(([k, v, s, l]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)",
                color: v ? "var(--accent-cyan)" : "var(--text-muted)", letterSpacing: "0.08em" }}>
                <div onClick={() => s(!v)} style={{
                  width: 32, height: 16, borderRadius: 8,
                  background: v ? "var(--accent-cyan)" : "var(--bg-elevated)",
                  border: `1px solid ${v ? "var(--accent-cyan)" : "var(--border)"}`,
                  position: "relative", cursor: "pointer", transition: "all 0.2s",
                  boxShadow: v ? "0 0 8px rgba(0,229,255,0.4)" : "none"
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: v ? "#000" : "var(--text-dim)",
                    position: "absolute", top: 2,
                    left: v ? 18 : 2, transition: "left 0.2s"
                  }} />
                </div>
                {l}
              </label>
            ))}
          </div>

          {/* Scan button */}
          <button onClick={handleAnalyze}
            disabled={loading || (!content && !file)}
            style={{
              padding: "14px 0", border: "none", cursor: "pointer",
              fontFamily: "var(--font-display)", fontSize: 13,
              letterSpacing: "0.18em", borderRadius: 4, transition: "all 0.2s",
              background: loading ? "var(--bg-elevated)" :
                (!content && !file) ? "var(--bg-elevated)" :
                "linear-gradient(90deg, #003344, #006688, #003344)",
              color: loading ? "var(--text-dim)" :
                (!content && !file) ? "var(--text-dim)" : "var(--accent-cyan)",
              border: `1px solid ${loading || (!content && !file) ? "var(--border)" : "rgba(0,229,255,0.3)"}`,
              boxShadow: (!loading && (content || file)) ? "0 0 20px rgba(0,229,255,0.15), inset 0 0 20px rgba(0,229,255,0.05)" : "none",
              backgroundSize: "200% 100%",
              animation: (!loading && (content || file)) ? "pulse-border 2s infinite" : "none",
            }}>
            {loading ? "// SCANNING..." : "▶ INITIATE_SCAN"}
          </button>

          {error && (
            <div style={{
              background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.3)",
              borderRadius: 4, padding: "12px 14px",
              color: "var(--accent-red)", fontSize: 12, fontFamily: "var(--font-mono)",
            }}>
              ✗ ERROR :: {error}
            </div>
          )}

          {/* Terminal */}
          <div style={{ ...card, borderColor: "rgba(0,229,255,0.08)" }}>
            <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
              letterSpacing: "0.18em", marginBottom: 10 }}>// SYSTEM_LOG</div>
            <Terminal lines={termLines} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--accent-cyan)", animation: "blink 1s infinite" }}>█</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result && !loading && (
            <div style={{ ...card, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
              <div style={{ fontSize: 64, color: "var(--text-dim)",
                fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>⬡</div>
              <div style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)",
                fontSize: 12, letterSpacing: "0.15em", textAlign: "center", lineHeight: 2 }}>
                AWAITING SCAN INPUT<br />
                <span style={{ fontSize: 10 }}>SUBMIT CONTENT TO INITIALIZE ANALYSIS</span>
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Summary bar */}
              <div style={{ ...card, display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 16,
                borderColor: result.risk_level === "critical" ? "rgba(255,34,68,0.3)" :
                  result.risk_level === "high" ? "rgba(255,170,0,0.3)" : "var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
                    letterSpacing: "0.18em", marginBottom: 8 }}>// SCAN_RESULT</div>
                  <div style={{ color: "var(--text-primary)", fontSize: 13,
                    fontFamily: "var(--font-mono)", lineHeight: 1.7, marginBottom: 12 }}>
                    {result.summary}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <RiskBadge level={result.risk_level} />
                    {result.classification && <RiskBadge level={result.classification} />}
                    <span style={{ fontSize: 11, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)" }}>
                      ACTION: <span style={{ color: "var(--accent-cyan)" }}>
                        {result.action?.toUpperCase()}
                      </span>
                    </span>
                    {result.brute_force_detected && (
                      <span style={{
                        background: "rgba(255,34,68,0.1)", color: "var(--accent-red)",
                        border: "1px solid rgba(255,34,68,0.3)",
                        borderRadius: 3, padding: "3px 10px",
                        fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em"
                      }}>⚠ BRUTE_FORCE_DETECTED</span>
                    )}
                  </div>
                </div>
                <RiskGauge score={result.risk_score} level={result.risk_level} />
              </div>

              {/* Result tabs */}
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)",
                paddingBottom: 0 }}>
                {resultTabs.map(t => (
                  <button key={t.id} onClick={() => setActiveResultTab(t.id)}
                    style={{
                      padding: "8px 18px", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
                      background: "transparent", borderRadius: "3px 3px 0 0",
                      color: activeResultTab === t.id ? "var(--accent-cyan)" : "var(--text-muted)",
                      borderBottom: `2px solid ${activeResultTab === t.id ? "var(--accent-cyan)" : "transparent"}`,
                      transition: "all 0.15s"
                    }}>
                    {t.label}
                    {t.count > 0 && (
                      <span style={{ marginLeft: 6, background: "rgba(0,229,255,0.15)",
                        color: "var(--accent-cyan)", borderRadius: 10,
                        padding: "1px 6px", fontSize: 10 }}>{t.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ animation: "fadeInUp 0.3s ease both" }}>
                {activeResultTab === "findings" && (
                  <div style={card}>
                    <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
                      letterSpacing: "0.18em", marginBottom: 14 }}>
                      // FINDINGS :: {result.findings?.length || 0} DETECTED
                    </div>
                    <FindingsTable findings={result.findings} />
                  </div>
                )}
                {activeResultTab === "insights" && (
                  <InsightsPanel result={result} />
                )}
                {activeResultTab === "log" && result.content_type === "log" && (
                  <div style={card}>
                    <div style={{ fontSize: 10, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)",
                      letterSpacing: "0.18em", marginBottom: 14 }}>// LOG_STREAM</div>
                    <LogViewer content={result.masked_content} flaggedLines={result.flagged_lines} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
