import re

PATTERNS = {
    "api_key": {
        "patterns": [
            r"(?i)(api[_-]?key|apikey)\s*[:=\s]\s*[\"']?([A-Za-z0-9\-_]{20,})[\"']?",
            r"(?i)sk-[A-Za-z0-9]{32,}",
            r"(?i)Bearer\s+[A-Za-z0-9\-_\.]{20,}",
        ],
        "risk": "high"
    },
    "password": {
        "patterns": [
            r"(?i)(password|passwd|pwd)\s*[:=]\s*[\"']?(\S{4,})[\"']?",
            r"(?i)(secret|pass)\s*[:=]\s*[\"']?(\S{4,})[\"']?",
        ],
        "risk": "critical"
    },
    "email": {
        "patterns": [r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"],
        "risk": "low"
    },
    "phone": {
        "patterns": [r"(?<!\d)(\+?1?\s?)?(\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})(?!\d)"],
        "risk": "low"
    },
    "token": {
        "patterns": [
            r"(?i)(token|auth[_-]?token|access[_-]?token)\s*[:=]\s*[\"']?([A-Za-z0-9\-_\.]{16,})[\"']?",
            r"(?i)ghp_[A-Za-z0-9]{36}",
        ],
        "risk": "high"
    },
    "private_key": {
        "patterns": [r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"],
        "risk": "critical"
    },
    "stack_trace": {
        "patterns": [
            r"(?i)(exception|traceback|NullPointerException|Error:)",
            r"(?i)File \".*\", line \d+",
        ],
        "risk": "medium"
    },
    "aws_key": {
        "patterns": [r"(?i)AKIA[0-9A-Z]{16}"],
        "risk": "critical"
    },
    "credit_card": {
        "patterns": [r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b"],
        "risk": "critical"
    },
    "sql_injection": {
        "patterns": [
            r"(?i)\bunion\s+select\b",
            r"(?i)\bor\s+1=1\b",
            r"(?i)[\"']\s*or\s*[\"']?\d",
            r"(?i)--",
            r"(?i)\bdrop\s+table\b",
            r"(?i)\binsert\s+into\b",
            r"(?i)\bxp_cmdshell\b",
        ],
        "risk": "critical"
    },
    "xss": {
        "patterns": [
            r"(?i)<script.*?>.*?</script>",
            r"(?i)onerror\s*=",
            r"(?i)javascript:",
            r"(?i)alert\s*\(",
        ],
        "risk": "high"
    },
    "prompt_injection": {
        "patterns": [
            r"(?i)ignore\s+previous\s+instructions",
            r"(?i)bypass\s+security",
            r"(?i)act\s+as\s+admin",
        ],
        "risk": "high"
    },
}


def detect_in_text(text: str) -> list:
    findings = []
    lines = text.split("\n")
    for line_num, line in enumerate(lines, start=1):
        for pattern_type, config in PATTERNS.items():
            for pattern in config["patterns"]:
                if re.search(pattern, line):
                    findings.append({
                        "type": pattern_type,
                        "risk": config["risk"],
                        "line": line_num,
                        "snippet": line.strip()[:120]
                    })
                    break
    return findings


def classify(findings: list) -> str:
    """Classify overall content as SAFE, SENSITIVE, or MALICIOUS."""
    if not findings:
        return "SAFE"
    for f in findings:
        if f["type"] in ("sql_injection", "xss", "prompt_injection"):
            return "MALICIOUS"
    return "SENSITIVE"
