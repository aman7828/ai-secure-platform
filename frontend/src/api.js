import axios from "axios"

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

export async function analyzeContent({ inputType, content, file, options }) {
  const formData = new FormData()
  formData.append("input_type", inputType)
  if (file) {
    formData.append("file", file)
  } else {
    formData.append("content", content)
  }
  formData.append("options", JSON.stringify(options))
  const res = await axios.post(`${BASE}/analyze/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}
