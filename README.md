# AI Secure Data Intelligence Platform

> AI Gateway · Data Scanner · Log Analyzer · Risk Engine

A full-stack cybersecurity platform that detects sensitive data, security vulnerabilities, and threats across text, files, logs, and SQL using regex pattern matching and Claude AI-powered insights.

---

## Features

- Multi-Input Support — Text, Log files, PDF/DOCX/TXT upload, SQL, Chat
- Regex Detection Engine — Detects API keys, passwords, tokens, emails, credit cards, AWS keys, private keys, SQL injection, XSS, prompt injection
- Log Analyzer — Line-by-line log scanning with brute-force detection
- Risk Engine — Weighted scoring with Critical/High/Medium/Low classification
- Policy Engine — Mask or block high-risk content
- AI Insights (Claude API) — Attack vectors, compliance flags (GDPR/PCI-DSS/SOC2), remediation guides
- Cyberpunk UI — Dark terminal-style React frontend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, Django 6.0, Django REST Framework |
| AI Engine | Anthropic Claude (claude-sonnet-4) |
| Detection | Custom Regex Engine + AI hybrid |
| File Parsing | PyMuPDF (PDF), python-docx (DOCX) |
| Frontend | React 18, Vite, Axios |
| Database | SQLite (development) |

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

1. Install dependencies:
   pip install django djangorestframework django-cors-headers pymupdf python-docx anthropic python-dotenv

2. Create .env file in root:
   ANTHROPIC_API_KEY=your_key_here
   DEBUG=True
   SECRET_KEY=your-secret-key

3. Run backend:
   python manage.py migrate
   python manage.py runserver

Backend runs at: http://127.0.0.1:8000

### Frontend Setup

1. cd frontend
2. npm install
3. npm run dev

Frontend runs at: http://localhost:5173

---

## API Reference

### POST /api/analyze/

Request fields:
  input_type : text | file | sql | chat | log
  content    : string
  options    : { mask: bool, block_high_risk: bool }

Response fields:
  summary            : human-readable summary
  classification     : SAFE | SENSITIVE | MALICIOUS
  findings           : list of detected issues with line, type, risk, snippet
  risk_score         : integer
  risk_level         : safe | low | medium | high | critical
  action             : allowed | masked | blocked
  insights           : AI-generated insight strings
  attack_vectors     : list of attack type labels
  compliance_flags   : GDPR / PCI-DSS / SOC2 / OWASP violations
  remediation        : per-type fix instructions
  severity_breakdown : count per risk level

### GET /api/health/

Returns server status.

---

## Project Structure

ai-secure-platform/
  manage.py
  .env
  core/
    settings.py
    urls.py
  analyzer/
    views.py          - API endpoints
    urls.py           - Routes
    detector.py       - Regex + classification engine
    log_analyzer.py   - Log-specific analysis
    risk_engine.py    - Risk scoring
    ai_insights.py    - Claude AI integration
    policy_engine.py  - Block/mask decisions
    file_parser.py    - PDF/DOCX/TXT parser
  frontend/
    src/
      App.jsx
      api.js
      components/
        FindingsTable.jsx
        InsightsPanel.jsx
        LogViewer.jsx
        RiskBadge.jsx
        RiskGauge.jsx
        DropZone.jsx

---

## Detection Capabilities

| Pattern          | Risk Level |
|------------------|------------|
| API Keys / Tokens | High      |
| Passwords        | Critical   |
| AWS Credentials  | Critical   |
| Private Keys     | Critical   |
| Credit Cards     | Critical   |
| SQL Injection    | Critical   |
| XSS Payloads     | High       |
| Prompt Injection | High       |
| Stack Traces     | Medium     |
| Emails / Phones  | Low        |

---

## Evaluation Criteria Coverage

| Criteria              | Implementation                              |
|-----------------------|---------------------------------------------|
| Backend Design        | Django REST API with modular architecture   |
| AI Integration        | Claude API with rule-based fallback         |
| Multi-Input Handling  | Text, File, Log, SQL, Chat                  |
| Log Analysis          | Line-by-line scanner + brute-force detection|
| Detection + Risk Engine | 12+ regex patterns + weighted scoring     |
| Policy Engine         | Mask / Block / Allow decisions              |
| Frontend UI           | Cyberpunk React dashboard                   |
| Security              | Input validation, CORS, safe error handling |

---

## Demo Test Input

Paste this into the TEXT tab to see a full critical scan:

  api_key=sk-prod-abc123xyz456789012345
  password=admin123
  SELECT * FROM users WHERE id=1 OR 1=1--
  <script>alert('xss')</script>

Expected result: MALICIOUS classification, CRITICAL risk score,
attack vectors SQL Injection + XSS detected, full remediation guide.
