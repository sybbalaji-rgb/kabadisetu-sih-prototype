from typing import List, Dict, Any
from collections import defaultdict

def aggregate_clusters(lots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cluster_map = defaultdict(lambda: {"material": "", "location": "", "lot_count": 0, "total_weight": 0.0})
    
    for lot in lots:
        cid = lot.get("cluster_id")
        if cid and lot.get("status") != "completed":
            c = cluster_map[str(cid)]
            c["material"] = str(lot.get("material", ""))
            c["location"] = str(lot.get("location", ""))
            c["lot_count"] += 1
            c["total_weight"] += float(lot.get("weight", 0.0))
            
    result = []
    for cid, data in cluster_map.items():
        result.append({
            "cluster_id": cid,
            "material": data["material"],
            "location": data["location"],
            "lot_count": data["lot_count"],
            "total_weight": round(data["total_weight"], 1)
        })
    return result
