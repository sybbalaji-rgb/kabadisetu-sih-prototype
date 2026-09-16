# KabadiSetu AI Vision & Scrap Classification Module
### Smart India Hackathon 2026 | Problem Statement: SIH26229

## Overview
The AI Scrap Classifier enables informal waste collectors to photograph any scrap item on their smartphone and instantly receive:
- Exact Item Identification (e.g. "Computer Mouse", "Phone Charger", "Motherboard").
- Statutory CPCB E-Waste Material Category (`cables`, `batteries`, `pcb`, `panels`, `motors`, `plastics`).
- Confidence Score (50% to 99%).
- Estimated Weight Guidance (in kg).
- Chemical Handling & Safety Tips (e.g., avoiding battery punctures, acid exposure, or open wire burning).

## Quick Start
```bash
# Set your Gemini API key (or uses default demo key)
export GEMINI_API_KEY="your_api_key_here"

# Run inference on any image
python scrap_classifier.py ../tests/sample_mouse.jpg
```
