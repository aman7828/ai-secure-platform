import re
from .detector import detect_in_text

BRUTE_FORCE_THRESHOLD = 5

LOG_ISSUE_PATTERNS = {
    "failed_login": {
        "pattern": r"(?i)(failed login|login failed|authentication failed|invalid credentials)",
        "risk": "medium",
        "label": "Failed login attempt"
    },
    "debug_leak": {
        "pattern": r"(?i)(debug mode|debug=true|verbose=true)",
        "risk": "medium",
        "label": "Debug mode leak"
    },
    "sql_error": {
        "pattern": r"(?i)(sql syntax|mysql error|ORA-\d+|sqlite3\.OperationalError)",
        "risk": "high",
        "label": "SQL error exposure"
    },
    "path_disclosure": {
        "pattern": r"(?i)(C:\\\\|/home/|/var/|/etc/)",
        "risk": "low",
        "label": "Internal path disclosed"
    },
}

def analyze_log(text: str) -> dict:
    lines = text.split("\n")
    base_findings = detect_in_text(text)
    log_findings = []
    for line_num, line in enumerate(lines, start=1):
        for issue_key, config in LOG_ISSUE_PATTERNS.items():
            if re.search(config["pattern"], line):
                log_findings.append({
                    "type": issue_key,
                    "risk": config["risk"],
                    "line": line_num,
                    "label": config["label"],
                    "snippet": line.strip()[:120]
                })
    failed_attempts = [
        i + 1 for i, line in enumerate(lines)
        if re.search(r"(?i)(failed login|authentication failed|invalid credentials)", line)
    ]
    brute_force_detected = len(failed_attempts) >= BRUTE_FORCE_THRESHOLD
    all_findings = base_findings + log_findings
    return {
        "findings": all_findings,
        "brute_force_detected": brute_force_detected,
        "brute_force_lines": failed_attempts if brute_force_detected else [],
        "total_lines": len(lines),
        "flagged_lines": list(set(f["line"] for f in all_findings)),
    }
