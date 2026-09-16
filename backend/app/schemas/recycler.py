from pydantic import BaseModel
from typing import Optional

class VerifyRecyclerRequest(BaseModel):
    profileId: str
    recyclerId: str
    verified: bool = True

class UpdatePriceRequest(BaseModel):
    profileId: str
    material: str
    low: float
    high: float

class PriceResponse(BaseModel):
    material: str
    low: float
    high: float
    source: str
    updatedAt: str
