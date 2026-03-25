import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .detector import detect_in_text, classify
from .log_analyzer import analyze_log
from .risk_engine import calculate_risk
from .policy_engine import apply_policy
from .ai_insights import get_ai_insights
from .file_parser import parse_file

class AnalyzeView(APIView):
    def post(self, request):
        input_type = request.data.get("input_type", "text")
        content = request.data.get("content", "")
        options = request.data.get("options", {})
        if isinstance(options, str):
            try:
                options = json.loads(options)
            except Exception:
                options = {}
        uploaded = request.FILES.get("file")
        if uploaded:
            content = parse_file(uploaded, uploaded.name)
            if uploaded.name.endswith((".log", ".txt")):
                input_type = "log"
        if not content:
            return Response({"error": "No content provided."}, status=status.HTTP_400_BAD_REQUEST)
        if input_type == "log":
            log_result = analyze_log(content)
            findings = log_result["findings"]
            brute_force = log_result["brute_force_detected"]
            extra = {
                "brute_force_detected": brute_force,
                "brute_force_lines": log_result["brute_force_lines"],
                "total_lines": log_result["total_lines"],
                "flagged_lines": log_result["flagged_lines"],
            }
        else:
            findings = detect_in_text(content)
            brute_force = False
            extra = {}
        classification = classify(findings)
        risk = calculate_risk(findings, brute_force)
        policy = apply_policy(content, findings, options)
        ai_result = get_ai_insights(content, findings, input_type)
        return Response({
            "summary": _build_summary(findings, risk["risk_level"], input_type),
            "classification": classification,
            "content_type": input_type,
            "findings": findings,
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
            "action": policy["action"],
            "masked_content": policy["masked_content"],
            "insights": ai_result.get("insights", []),
            "severity_breakdown": ai_result.get("severity_breakdown", {}),
            "attack_vectors": ai_result.get("attack_vectors", []),
            "compliance_flags": ai_result.get("compliance_flags", []),
            "remediation": ai_result.get("remediation", {}),
            "threat_score_explanation": ai_result.get("threat_score_explanation", ""),
            **extra
        })

class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok", "message": "AI Secure Platform running"})

def _build_summary(findings, risk_level, input_type):
    if not findings:
        return f"No sensitive data detected in {input_type}."
    types = list({f["type"] for f in findings})
    return f"{input_type.capitalize()} contains {len(findings)} finding(s): {', '.join(types)}. Risk level: {risk_level}."
