from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    role: str # collector, recycler, authority
    displayName: str
    contact: str
    authorizationId: Optional[str] = None
    serviceArea: Optional[str] = ""

class UserResponse(BaseModel):
    id: str
    role: str
    displayName: str
    contact: str
    authorizationId: Optional[str] = None
    serviceArea: str
    verified: bool
