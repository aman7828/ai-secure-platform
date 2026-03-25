RISK_WEIGHTS = {"critical": 10, "high": 5, "medium": 3, "low": 1}
RISK_LEVEL_THRESHOLDS = [(20, "critical"), (10, "high"), (5, "medium"), (1, "low"), (0, "safe")]

def calculate_risk(findings: list, brute_force: bool = False) -> dict:
    score = sum(RISK_WEIGHTS.get(f.get("risk", "low"), 1) for f in findings)
    if brute_force:
        score += 8
    risk_level = "safe"
    for threshold, level in RISK_LEVEL_THRESHOLDS:
        if score >= threshold:
            risk_level = level
            break
    return {"risk_score": score, "risk_level": risk_level}
