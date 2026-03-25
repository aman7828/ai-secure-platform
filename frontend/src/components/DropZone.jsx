import { useDropzone } from "react-dropzone"

export default function DropZone({ onFile, file }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (f) => f[0] && onFile(f[0]),
    multiple: false,
    accept: {
      "text/plain": [".txt", ".log"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    }
  })
  return (
    <div {...getRootProps()} style={{
      border: `1px dashed ${isDragActive ? "var(--accent-cyan)" : "#0d3a4a"}`,
      borderRadius: 4, padding: "28px 20px", textAlign: "center", cursor: "pointer",
      background: isDragActive ? "rgba(0,229,255,0.04)" : "var(--bg-void)",
      transition: "all 0.2s",
      boxShadow: isDragActive ? "inset 0 0 30px rgba(0,229,255,0.05)" : "none",
    }}>
      <input {...getInputProps()} />
      <div style={{ fontSize: 28, marginBottom: 10, color: isDragActive ? "var(--accent-cyan)" : "#0d3a4a" }}>
        {isDragActive ? "▼" : "⊞"}
      </div>
      {file ? (
        <div>
          <div style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            ▸ {file.name}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4, fontFamily: "var(--font-mono)" }}>
            {(file.size / 1024).toFixed(1)} KB · READY
          </div>
        </div>
      ) : (
        <div>
          <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12,
            letterSpacing: "0.1em" }}>
            {isDragActive ? "RELEASE TO UPLOAD" : "DROP FILE OR CLICK TO SELECT"}
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)" }}>
            .txt · .log · .pdf · .docx
          </div>
        </div>
      )}
    </div>
  )
}
