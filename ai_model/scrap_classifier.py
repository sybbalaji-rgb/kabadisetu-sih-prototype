"""
KabadiSetu AI Scrap Classifier
Smart India Hackathon 2026 | Problem Statement: SIH26229
Automated e-waste material classification under CPCB/EPR and JNARDDC norms.
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional

# Supported statutory CPCB e-waste categories
VALID_MATERIALS = ["cables", "batteries", "pcb", "panels", "motors", "plastics"]

VISION_PROMPT = """You are an expert AI vision classifier for Indian e-waste recycling, certified under CPCB/EPR norms and JNARDDC standards.
TASK: Look carefully at the actual physical object in the image. Identify it precisely.
Return ONLY a JSON object with these exact keys:
{
  "object": "The specific item name (e.g. Computer Mouse, USB Keyboard, Li-ion Battery, Printed Circuit Board, LCD Monitor, Electric Motor, Mobile Phone Charger).",
  "category": "Formal e-waste category. Choose from: Computer Peripherals | Cables & Wiring | Portable Batteries / Cells | Printed Circuit Boards (PCBs) | Screens & Monitors | Motors & Inductors | Chargers & Power Adapters | Mobile Devices",
  "material": "Exactly ONE of: cables | batteries | pcb | panels | motors | plastics",
  "confidence": 92,
  "condition": "Exactly ONE of: Sorted | Mixed | Damaged",
  "components": ["List of 2 to 5 specific physical sub-components or materials"],
  "suggestedWeight": 0.15,
  "explanation": "Brief description of the item and its recovery value.",
  "safetyTip": "Practical safety advice specific to this item."
}
"""

def normalize_material(raw_mat: str, object_name: str, category_name: str) -> str:
    """Strictly maps classification tokens into one of the 6 statutory CPCB categories."""
    m = (raw_mat or "").lower().strip()
    if m in ["cables", "cable", "wire", "wires", "cord", "cords"]:
        return "cables"
    if m in ["batteries", "battery", "cell", "cells", "accumulator", "li-ion"]:
        return "batteries"
    if m in ["pcb", "pcbs", "circuit", "board", "motherboard"]:
        return "pcb"
    if m in ["panels", "panel", "display", "screen", "monitor", "crt", "lcd"]:
        return "panels"
    if m in ["motors", "motor", "compressor", "rotor", "stator"]:
        return "motors"
    if m in ["plastics", "plastic", "casing", "shell"]:
        return "plastics"

    combined = f"{object_name} {category_name}".lower()
    if any(k in combined for k in ["cable", "wire", "cord"]):
        return "cables"
    if any(k in combined for k in ["battery", "cell", "accumulator"]):
        return "batteries"
    if any(k in combined for k in ["pcb", "circuit", "motherboard"]):
        return "pcb"
    if any(k in combined for k in ["screen", "monitor", "panel", "display"]):
        return "panels"
    if any(k in combined for k in ["motor", "compressor", "rotor"]):
        return "motors"
    return "plastics"

def classify_scrap_image(image_path: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes an e-waste scrap image using Gemini Vision API with multi-model fallback.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    ext = os.path.splitext(image_path)[1].lower()
    mime_type = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"

    # Read API Key
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        # Fallback to prototype demonstration key
        key = base64.b64decode("QVEuQWI4Uk42SlF5RFdDalg5aFFSekt5TGdQTENuV0g2VlZFb0ctQklEOU9XMkNBVGNEdEE=").decode("utf-8")

    candidate_models = ["gemini-flash-latest", "gemini-flash-lite-latest"]
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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        req = urllib.request.Request(
            url,
            data=payload_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    raw_text = resp_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    parsed = json.loads(raw_text.strip())

                    obj = str(parsed.get("object", "E-Waste Item")).strip()
                    cat = str(parsed.get("category", "Small IT Equipment")).strip()
                    raw_mat = str(parsed.get("material", "plastics"))
                    mat = normalize_material(raw_mat, obj, cat)

                    return {
                        "object": obj,
                        "category": cat,
                        "material": mat,
                        "confidence": max(50, min(99, int(parsed.get("confidence", 90)))),
                        "condition": parsed.get("condition", "Sorted"),
                        "components": parsed.get("components", ["Plastic casing", "Internal electronics"]),
                        "suggestedWeight": float(parsed.get("suggestedWeight", 0.2)),
                        "explanation": str(parsed.get("explanation", "Scrap item identified from photo.")),
                        "safetyTip": str(parsed.get("safetyTip", "Handle with care and wear protective gloves.")),
                        "modelUsed": model
                    }
        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"Vision inference failed across all models. Last error: {last_error}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scrap_classifier.py <path_to_scrap_image>")
        sys.exit(1)

    filepath = sys.argv[1]
    print(f"Analyzing {filepath} ...")
    try:
        result = classify_scrap_image(filepath)
        print(json.dumps(result, indent=2))
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)
