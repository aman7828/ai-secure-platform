import json
import anthropic
from django.conf import settings


def get_ai_insights(content: str, findings: list, input_type: str) -> dict:
    """
    Returns a rich insights object with:
    - insights: list of AI-generated or rule-based insight strings
    - severity_breakdown: count per risk level
    - attack_vectors: possible attack types detected
    - compliance_flags: GDPR/PCI/HIPAA/SOC2 flags
    - remediation: actionable fix suggestions per finding type
    - threat_score_explanation: why the score is what it is
    """
    severity_breakdown = _severity_breakdown(findings)
    attack_vectors = _detect_attack_vectors(findings)
    compliance_flags = _check_compliance(findings)
    remediation = _generate_remediation(findings)

    api_key = settings.ANTHROPIC_API_KEY
    if api_key:
        insights = _get_claude_insights(content, findings, input_type, api_key)
    else:
        insights = _rule_based_insights(findings)

    threat_explanation = _threat_score_explanation(findings)

    return {
        "insights": insights,
        "severity_breakdown": severity_breakdown,
        "attack_vectors": attack_vectors,
        "compliance_flags": compliance_flags,
        "remediation": remediation,
        "threat_score_explanation": threat_explanation,
    }


# ─── Claude API Call ────────────────────────────────────────────────────────

def _get_claude_insights(content: str, findings: list, input_type: str, api_key: str) -> list:
    try:
        client = anthropic.Anthropic(api_key=api_key)

        findings_summary = "\n".join([
            f"- Line {f.get('line', '?')}: {f['type']} ({f['risk']} risk) | {f.get('snippet', '')[:80]}"
            for f in findings[:25]
        ])

        types_found = list({f["type"] for f in findings})
        risks_found = list({f["risk"] for f in findings})

        prompt = f"""You are a senior cybersecurity analyst performing a security audit on {input_type} data.

FINDINGS DETECTED ({len(findings)} total):
{findings_summary if findings_summary else "No findings detected."}

FINDING TYPES: {", ".join(types_found) if types_found else "none"}
RISK LEVELS PRESENT: {", ".join(risks_found) if risks_found else "none"}

CONTENT SAMPLE (first 600 chars):
{content[:600]}

Your task: Generate 4-6 specific, actionable, non-generic security insights.
Each insight must:
1. Reference the actual finding types detected
2. Explain the real-world impact
3. Suggest a concrete next step

Return ONLY a valid JSON array of strings. No markdown, no explanation, no preamble.
Example format: ["Insight one.", "Insight two.", "Insight three."]"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=700,
            messages=[{"role": "user", "content": prompt}]
        )

        text = message.content[0].text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        return result if isinstance(result, list) else [str(result)]

    except Exception as e:
        print(f"[Claude API Error]: {e}")
        return _rule_based_insights(findings)


# ─── Rule-Based Insights (fallback) ─────────────────────────────────────────

def _rule_based_insights(findings: list) -> list:
    insights = []
    types = {f["type"] for f in findings}
    risks = {f["risk"] for f in findings}
    lines_by_type = {}
    for f in findings:
        lines_by_type.setdefault(f["type"], []).append(str(f.get("line", "?")))

    if "password" in types:
        lines = ", ".join(lines_by_type["password"][:3])
        insights.append(f"Plaintext passwords found at line(s) {lines} — rotate all credentials and use a secrets manager like HashiCorp Vault or AWS Secrets Manager.")

    if "api_key" in types:
        lines = ", ".join(lines_by_type["api_key"][:3])
        insights.append(f"API keys exposed at line(s) {lines} — revoke immediately via your provider dashboard and never store keys in code or logs.")

    if "token" in types:
        lines = ", ".join(lines_by_type["token"][:3])
        insights.append(f"Auth tokens detected at line(s) {lines} — tokens grant full session access. Invalidate them and implement short TTLs.")

    if "aws_key" in types:
        insights.append("AWS access keys found — run 'aws iam list-access-keys' to audit usage, revoke immediately, and enable CloudTrail alerts for unauthorized API calls.")

    if "private_key" in types:
        insights.append("Private key material detected — this is a critical breach. Regenerate all affected certificates and audit for unauthorized use immediately.")

    if "credit_card" in types:
        insights.append("Credit card numbers found — potential PCI-DSS violation. Report to your compliance officer, notify affected users, and audit data storage practices.")

    if "sql_injection" in types:
        insights.append("SQL injection patterns detected — use parameterized queries or ORM methods. Never concatenate user input into SQL strings.")

    if "xss" in types:
        insights.append("XSS payloads found — sanitize all user inputs with a library like DOMPurify and implement a strict Content Security Policy (CSP) header.")

    if "prompt_injection" in types:
        insights.append("Prompt injection attempts detected — validate and sanitize all AI model inputs. Implement input guardrails before passing data to LLMs.")

    if "stack_trace" in types:
        insights.append("Stack traces exposed — these reveal internal file paths and library versions. Disable verbose error reporting in production environments.")

    if "email" in types:
        insights.append("Email addresses found in data — review GDPR Article 5 compliance. Personal data should be minimized, anonymized, or pseudonymized in logs.")

    if "brute_force" in types:
        insights.append("Repeated failed login attempts detected — implement account lockout, CAPTCHA, and alerting for authentication anomalies.")

    if "critical" in risks:
        insights.append("CRITICAL severity findings present — treat as an active incident. Isolate affected systems and begin incident response procedures.")
    elif "high" in risks:
        insights.append("High severity findings present — remediate within 24 hours per standard security SLAs.")

    if not insights:
        insights.append("No critical issues detected. Continue routine security monitoring and scheduled audits.")

    return insights


# ─── Severity Breakdown ──────────────────────────────────────────────────────

def _severity_breakdown(findings: list) -> dict:
    breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        level = f.get("risk", "low")
        if level in breakdown:
            breakdown[level] += 1
    return breakdown


# ─── Attack Vector Detection ─────────────────────────────────────────────────

ATTACK_VECTOR_MAP = {
    "sql_injection":    "SQL Injection",
    "xss":              "Cross-Site Scripting (XSS)",
    "prompt_injection": "Prompt Injection / LLM Attack",
    "private_key":      "Credential Theft / Key Exfiltration",
    "aws_key":          "Cloud Account Takeover",
    "api_key":          "API Abuse / Unauthorized Access",
    "password":         "Credential Stuffing / Brute Force",
    "token":            "Session Hijacking",
    "credit_card":      "Financial Fraud / Data Breach",
    "stack_trace":      "Information Disclosure",
    "email":            "Phishing / Social Engineering",
}

def _detect_attack_vectors(findings: list) -> list:
    seen = set()
    vectors = []
    for f in findings:
        vec = ATTACK_VECTOR_MAP.get(f["type"])
        if vec and vec not in seen:
            seen.add(vec)
            vectors.append(vec)
    return vectors


# ─── Compliance Flags ────────────────────────────────────────────────────────

def _check_compliance(findings: list) -> list:
    flags = []
    types = {f["type"] for f in findings}

    if "email" in types or "credit_card" in types or "phone" in types:
        flags.append("GDPR — Personal data detected. Review data minimization and retention policies.")

    if "credit_card" in types:
        flags.append("PCI-DSS — Cardholder data found. Immediate compliance review required.")

    if "password" in types or "api_key" in types or "token" in types:
        flags.append("SOC 2 Type II — Secret/credential exposure violates access control requirements.")

    if "private_key" in types or "aws_key" in types:
        flags.append("ISO 27001 — Cryptographic key material exposed. Incident response required.")

    if "stack_trace" in types or "sql_injection" in types:
        flags.append("OWASP Top 10 — Information disclosure and injection risks detected.")

    return flags


# ─── Remediation Map ─────────────────────────────────────────────────────────

REMEDIATION_MAP = {
    "api_key":          "Revoke the exposed key immediately. Rotate secrets using a vault (e.g. AWS Secrets Manager, HashiCorp Vault). Add pre-commit hooks to prevent future leaks.",
    "password":         "Rotate the exposed password immediately. Enforce hashed storage (bcrypt/argon2). Use a secrets manager — never store passwords in plaintext.",
    "token":            "Invalidate the token via your auth provider. Implement short-lived JWTs (15 min TTL) and refresh token rotation.",
    "aws_key":          "Deactivate the key in AWS IAM Console. Run CloudTrail audit for unauthorized usage. Enable AWS GuardDuty for future detection.",
    "private_key":      "Revoke the certificate immediately. Regenerate with a new key pair. Store private keys only in HSMs or encrypted vaults.",
    "email":            "Anonymize or pseudonymize email addresses in logs. Review data retention policies per GDPR Article 5.",
    "credit_card":      "Immediately notify your PCI-DSS compliance officer. Remove card data from logs. Implement tokenization for cardholder data.",
    "stack_trace":      "Set DEBUG=False in production. Implement a global exception handler that logs internally but returns generic error messages to users.",
    "sql_injection":    "Replace all raw SQL with parameterized queries or ORM. Add a WAF (Web Application Firewall) rule to block injection patterns.",
    "xss":              "Sanitize all user inputs with DOMPurify. Set Content-Security-Policy headers. Use template auto-escaping.",
    "prompt_injection": "Implement input validation for all LLM prompts. Use system-level guardrails and never expose raw user input to AI models.",
    "phone":            "Mask phone numbers in logs. Review GDPR compliance for personal data handling.",
    "failed_login":     "Implement account lockout after 5 failed attempts. Add CAPTCHA and MFA. Alert on anomalous login patterns.",
}

def _generate_remediation(findings: list) -> dict:
    remediation = {}
    for f in findings:
        t = f["type"]
        if t not in remediation and t in REMEDIATION_MAP:
            remediation[t] = REMEDIATION_MAP[t]
    return remediation


# ─── Threat Score Explanation ────────────────────────────────────────────────

def _threat_score_explanation(findings: list) -> str:
    if not findings:
        return "Score is 0 — no sensitive patterns detected in the submitted content."

    critical = [f for f in findings if f["risk"] == "critical"]
    high     = [f for f in findings if f["risk"] == "high"]
    medium   = [f for f in findings if f["risk"] == "medium"]
    low      = [f for f in findings if f["risk"] == "low"]

    parts = []
    if critical:
        parts.append(f"{len(critical)} critical finding(s) (+{len(critical)*10} pts)")
    if high:
        parts.append(f"{len(high)} high finding(s) (+{len(high)*5} pts)")
    if medium:
        parts.append(f"{len(medium)} medium finding(s) (+{len(medium)*3} pts)")
    if low:
        parts.append(f"{len(low)} low finding(s) (+{len(low)*1} pts)")

    return "Risk score composed of: " + ", ".join(parts) + "."
