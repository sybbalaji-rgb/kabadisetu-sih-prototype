from pydantic import BaseModel
from typing import Optional, List

class CreateLotRequest(BaseModel):
    profileId: str
    material: str
    weight: float
    condition: str
    location: str
    imageName: Optional[str] = "uploaded-scrap.jpg"
    imageKey: Optional[str] = None
    aiConfidence: Optional[float] = 0.0

class LotResponse(BaseModel):
    id: str
    collectorId: str
    material: str
    weight: float
    condition: str
    location: str
    createdAt: str
    estimatedMin: float
    estimatedMax: float
    status: str
    syncStatus: str = "synced"
    imageName: str
    imageKey: Optional[str] = None
    aiConfidence: float
    clusterJoined: bool = False
    clusterId: Optional[str] = None
    selectedRecyclerId: Optional[str] = None
    lockedRate: Optional[float] = None
    fairLockId: Optional[str] = None
    validUntil: Optional[str] = None
    pickupDate: Optional[str] = None
    finalWeight: Optional[float] = None
    finalRate: Optional[float] = None
    paymentStatus: Optional[str] = None
    handoverCode: Optional[str] = None
    passportId: Optional[str] = None
    completedAt: Optional[str] = None
    priceChangeReason: Optional[str] = None
    recyclerRating: Optional[int] = None
    recyclerReview: Optional[str] = None

class ScanResponse(BaseModel):
    object: str
    category: str
    material: str
    confidence: int
    condition: str
    components: List[str]
    suggestedWeight: float
    explanation: str
    safetyTip: str
    imageKey: Optional[str] = None
    lowConfidence: bool = False
