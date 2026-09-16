from typing import List, Dict, Any

def rank_recyclers_for_lot(lot: Dict[str, Any], recyclers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    ranked = []
    for rec in recyclers:
        score = 0.0
        if rec.get("verified"): score += 50
        if lot.get("location", "").lower() in rec.get("serviceArea", "").lower(): score += 30
        rating = float(rec.get("rating", 4.0))
        score += rating * 4
        
        ranked.append({
            **rec,
            "matchScore": round(score, 1)
        })
    return sorted(ranked, key=lambda x: x["matchScore"], reverse=True)
