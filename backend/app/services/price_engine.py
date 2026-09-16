from typing import Tuple, Dict

DEFAULT_PRICES: Dict[str, Tuple[float, float]] = {
    "cables": (78.0, 96.0),
    "batteries": (42.0, 60.0),
    "pcb": (210.0, 285.0),
    "panels": (24.0, 44.0),
    "motors": (58.0, 82.0),
    "plastics": (12.0, 24.0),
}

CONDITION_FACTORS = {
    "Sorted": 1.0,
    "Mixed": 0.9,
    "Damaged": 0.8
}

def calculate_lot_estimates(material: str, weight: float, condition: str, price_override: Tuple[float, float] = None) -> Tuple[float, float]:
    low, high = price_override or DEFAULT_PRICES.get(material, (15.0, 30.0))
    factor = CONDITION_FACTORS.get(condition, 1.0)
    
    est_min = round(low * factor * weight, 1)
    est_max = round(high * factor * weight, 1)
    return est_min, est_max
