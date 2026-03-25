import re

MASK_PATTERNS = {
    "email":    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    "api_key":  r"(?i)sk-[A-Za-z0-9]{20,}",
    "password": r"(?i)(password|passwd|pwd)\s*[:=]\s*[\"']?(\S{4,})[\"']?",
    "token":    r"(?i)(token)\s*[:=]\s*[\"']?([A-Za-z0-9\-_\.]{16,})[\"']?",
    "credit_card": r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\b",
}

BLOCK_RISK_LEVELS = {"critical", "high"}

def apply_policy(content: str, findings: list, options: dict) -> dict:
    masked_content = content
    if options.get("block_high_risk", False):
        for finding in findings:
            if finding.get("risk") in BLOCK_RISK_LEVELS:
                return {"action": "blocked", "masked_content": None, "reason": f"Blocked due to {finding['risk']} risk: {finding['type']}"}
    if options.get("mask", False):
        for pattern_type, pattern in MASK_PATTERNS.items():
            masked_content = re.sub(pattern, f"[REDACTED-{pattern_type.upper()}]", masked_content)
        return {"action": "masked", "masked_content": masked_content, "reason": None}
    return {"action": "allowed", "masked_content": masked_content, "reason": None}
