import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import Profile
from backend.app.schemas.user import UserRegister, UserResponse
from backend.app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    if payload.role not in ["collector", "recycler", "authority"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    if payload.role == "authority":
        if payload.authorizationId != settings.AUTHORITY_ACCESS_CODE:
            raise HTTPException(status_code=403, detail="Invalid authority access code")

    contact = payload.contact.lower().strip()
    existing = db.query(Profile).filter(Profile.role == payload.role, Profile.contact == contact).first()

    if existing:
        existing.display_name = payload.displayName
        existing.service_area = payload.serviceArea or ""
        if payload.authorizationId:
            existing.authorization_id = payload.authorizationId
        db.commit()
        db.refresh(existing)
        return UserResponse(
            id=existing.id,
            role=existing.role,
            displayName=existing.display_name,
            contact=existing.contact,
            authorizationId=existing.authorization_id,
            serviceArea=existing.service_area,
            verified=bool(existing.verified) or existing.role == "authority"
        )

    prefix = "COL" if payload.role == "collector" else "REC" if payload.role == "recycler" else "AUT"
    profile_id = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"
    new_profile = Profile(
        id=profile_id,
        role=payload.role,
        display_name=payload.displayName,
        contact=contact,
        authorization_id=payload.authorizationId,
        service_area=payload.serviceArea or "",
        verified=1 if payload.role == "authority" else 0,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return UserResponse(
        id=new_profile.id,
        role=new_profile.role,
        displayName=new_profile.display_name,
        contact=new_profile.contact,
        authorizationId=new_profile.authorization_id,
        serviceArea=new_profile.service_area,
        verified=bool(new_profile.verified) or new_profile.role == "authority"
    )
