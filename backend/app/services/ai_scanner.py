import json
import base64
import urllib.request
from typing import Dict, Any
from backend.app.config import settings

VALID_MATERIALS = {"cables", "batteries", "pcb", "panels", "motors", "plastics"}

VISION_PROMPT = """You are an expert AI vision classifier for Indian e-waste recycling, certified under CPCB/EPR norms and JNARDDC standards.
TASK: Look carefully at the actual physical object in the image. Identify it precisely.
Return ONLY a JSON object with these exact keys:
{
  "object": "The specific item name (e.g. Computer Mouse, Mobile Phone Charger, Li-ion Battery).",
  "category": "Formal e-waste category.",
  "material": "Exactly ONE of: cables | batteries | pcb | panels | motors | plastics",
  "confidence": 92,
  "condition": "Sorted",
  "components": ["List of 2 to 5 sub-components"],
  "suggestedWeight": 0.15,
  "explanation": "Brief description",
  "safetyTip": "Practical safety advice"
}
"""

def normalize_material(raw_mat: str, object_name: str, category_name: str) -> str:
    m = (raw_mat or "").lower().strip()
    if m in ["cables", "cable", "wire", "wires", "cord"]: return "cables"
    if m in ["batteries", "battery", "cell", "cells", "accumulator"]: return "batteries"
    if m in ["pcb", "pcbs", "circuit", "board", "motherboard"]: return "pcb"
    if m in ["panels", "panel", "display", "screen", "monitor"]: return "panels"
    if m in ["motors", "motor", "compressor", "rotor"]: return "motors"
    if m in ["plastics", "plastic", "casing", "shell"]: return "plastics"

    combined = f"{object_name} {category_name}".lower()
    if any(k in combined for k in ["cable", "wire", "cord"]): return "cables"
    if any(k in combined for k in ["battery", "cell", "accumulator"]): return "batteries"
    if any(k in combined for k in ["pcb", "circuit", "motherboard"]): return "pcb"
    if any(k in combined for k in ["screen", "monitor", "panel", "display"]): return "panels"
    if any(k in combined for k in ["motor", "compressor", "rotor"]): return "motors"
    return "plastics"

def scan_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    candidate_models = [settings.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"]
    
    payload_dict = {
        "contents": [
            {
                "parts": [
                    {"text": VISION_PROMPT},
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
            "maxOutputTokens": 1024
        }
    }
    payload_bytes = json.dumps(payload_dict).encode("utf-8")

    last_error = None
    for model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
        req = urllib.request.Request(
            url,
            data=payload_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    parsed = json.loads(text.strip())

                    obj = str(parsed.get("object", "E-Waste Item")).strip()
                    cat = str(parsed.get("category", "Computer Peripherals / Small IT Equipment")).strip()
                    mat = normalize_material(str(parsed.get("material", "plastics")), obj, cat)
                    conf = max(50, min(99, int(parsed.get("confidence", 90))))

                    return {
                        "object": obj,
                        "category": cat,
                        "material": mat,
                        "confidence": conf,
                        "condition": parsed.get("condition", "Sorted"),
                        "components": parsed.get("components", ["Plastic housing", "Internal circuitry"]),
                        "suggestedWeight": float(parsed.get("suggestedWeight", 0.2)),
                        "explanation": str(parsed.get("explanation", "Scrap item identified from photo.")),
                        "safetyTip": str(parsed.get("safetyTip", "Handle with gloves and keep isolated from flame.")),
                        "lowConfidence": conf < 65
                    }
        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"Vision API invocation failed: {last_error}")
