import json
from groq import Groq
from core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

JUDGE_PROMPT = """You are an expert AICTE regulatory analyst. Determine if these two institution name/address records refer to the SAME physical institution, despite possible differing spellings, abbreviations, or formatting.

Record A: {record_a}
Record B: {record_b}

Think step-by-step (Chain-of-Thought), then output ONLY valid JSON in this exact format:
{{"is_same_institution": true/false, "confidence": 0.0-1.0, "reasoning": "short explanation"}}
"""

def call_groq(*args, **kwargs):
    if client is None:
        return None
    return client.chat.completions.create(*args, **kwargs)

def judge_same_institution(record_a: str, record_b: str) -> dict:
    if client is None:
        return {
            "is_same_institution": True,
            "confidence": 0.9,
            "reasoning": "[DEMO MODE — GROQ_API_KEY not set] Simulated high-confidence match based on name overlap."
        }

    completion = call_groq(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(record_a=record_a, record_b=record_b)}],
        temperature=0.1,
        response_format={"type": "json_object"},
    )
    content = completion.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"is_same_institution": False, "confidence": 0.0, "reasoning": "LLM parse error"}

