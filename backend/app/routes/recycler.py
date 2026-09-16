from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import Profile
from backend.app.models.recycler import MaterialPrice
from backend.app.schemas.recycler import VerifyRecyclerRequest, UpdatePriceRequest, PriceResponse

router = APIRouter(prefix="/recycler", tags=["Recycler & Market Management"])

@router.get("/prices", response_model=List[PriceResponse])
def get_prices(db: Session = Depends(get_db)):
    prices = db.query(MaterialPrice).all()
    return [
        PriceResponse(
            material=p.material,
            low=p.low_rate,
            high=p.high_rate,
            source=p.source,
            updatedAt=p.updated_at
        ) for p in prices
    ]

@router.post("/verify")
def verify_recycler(payload: VerifyRecyclerRequest, db: Session = Depends(get_db)):
    admin = db.query(Profile).filter(Profile.id == payload.profileId, Profile.role == "authority").first()
    if not admin:
        raise HTTPException(status_code=403, detail="Only regulatory authority can verify recyclers")
        
    rec = db.query(Profile).filter(Profile.id == payload.recyclerId, Profile.role == "recycler").first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recycler profile not found")
        
    rec.verified = 1 if payload.verified else 0
    db.commit()
    return {"status": "success", "recyclerId": rec.id, "verified": bool(rec.verified)}

@router.post("/price")
def update_price(payload: UpdatePriceRequest, db: Session = Depends(get_db)):
    admin = db.query(Profile).filter(Profile.id == payload.profileId, Profile.role == "authority").first()
    if not admin:
        raise HTTPException(status_code=403, detail="Only regulatory authority can update baseline prices")
        
    price = db.query(MaterialPrice).filter(MaterialPrice.material == payload.material).first()
    now = datetime.utcnow().isoformat()
    if price:
        price.low_rate = payload.low
        price.high_rate = payload.high
        price.updated_by = admin.id
        price.updated_at = now
    else:
        price = MaterialPrice(
            material=payload.material,
            low_rate=payload.low,
            high_rate=payload.high,
            source="JNARDDC reference baseline",
            updated_by=admin.id,
            updated_at=now
        )
        db.add(price)
    db.commit()
    return {"status": "success", "material": payload.material, "low": payload.low, "high": payload.high}
