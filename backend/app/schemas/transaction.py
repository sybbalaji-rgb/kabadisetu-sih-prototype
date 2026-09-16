from pydantic import BaseModel
from typing import Optional

class FairLockRequest(BaseModel):
    profileId: str
    lotId: str
    lockedRate: float
    pickupDate: Optional[str] = None

class CompleteHandoverRequest(BaseModel):
    profileId: str
    lotId: str
    finalWeight: float
    finalRate: float
    paymentStatus: str = "paid"
    collectorApproved: bool = True
    priceChangeReason: Optional[str] = None

class RateRecyclerRequest(BaseModel):
    profileId: str
    lotId: str
    rating: int
    review: Optional[str] = ""

class SupportTicketRequest(BaseModel):
    profileId: str
    kind: str
    message: str
    rating: Optional[int] = None
