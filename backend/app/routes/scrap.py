import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.scrap import Lot
from backend.app.models.recycler import MaterialPrice
from backend.app.schemas.scrap import CreateLotRequest, LotResponse, ScanResponse
from backend.app.services.ai_scanner import scan_image_bytes
from backend.app.services.price_engine import calculate_lot_estimates

router = APIRouter(prefix="/scrap", tags=["Scrap & AI Scanner"])

@router.post("/scan", response_model=ScanResponse)
async def scan_scrap(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")
    
    contents = await image.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 10MB")
    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="Image file is empty or corrupted")
        
    try:
        result = scan_image_bytes(contents, image.content_type)
        return ScanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI scanner failed: {str(e)}")

@router.post("/lots", response_model=LotResponse)
def create_lot(payload: CreateLotRequest, db: Session = Depends(get_db)):
    price_rec = db.query(MaterialPrice).filter(MaterialPrice.material == payload.material).first()
    price_range = (price_rec.low_rate, price_rec.high_rate) if price_rec else None
    
    est_min, est_max = calculate_lot_estimates(
        payload.material,
        payload.weight,
        payload.condition,
        price_range
    )
    
    lot_id = f"LOT-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.utcnow().isoformat()
    new_lot = Lot(
        id=lot_id,
        collector_id=payload.profileId,
        material=payload.material,
        weight=payload.weight,
        condition=payload.condition,
        location=payload.location,
        image_name=payload.imageName or "scrap.jpg",
        image_key=payload.imageKey,
        ai_confidence=payload.aiConfidence or 0.0,
        estimated_min=est_min,
        estimated_max=est_max,
        status="available",
        created_at=now,
        updated_at=now
    )
    db.add(new_lot)
    db.commit()
    db.refresh(new_lot)
    
    return LotResponse(
        id=new_lot.id,
        collectorId=new_lot.collector_id,
        material=new_lot.material,
        weight=new_lot.weight,
        condition=new_lot.condition,
        location=new_lot.location,
        createdAt=new_lot.created_at,
        estimatedMin=new_lot.estimated_min,
        estimatedMax=new_lot.estimated_max,
        status=new_lot.status,
        imageName=new_lot.image_name,
        imageKey=new_lot.image_key,
        aiConfidence=new_lot.ai_confidence
    )

@router.get("/lots", response_model=List[LotResponse])
def list_lots(profileId: str, role: str, db: Session = Depends(get_db)):
    if role == "collector":
        lots = db.query(Lot).filter(Lot.collector_id == profileId).all()
    elif role == "recycler":
        lots = db.query(Lot).filter((Lot.status == "available") | (Lot.recycler_id == profileId)).all()
    else:
        lots = db.query(Lot).all()
        
    return [
        LotResponse(
            id=l.id,
            collectorId=l.collector_id,
            material=l.material,
            weight=l.weight,
            condition=l.condition,
            location=l.location,
            createdAt=l.created_at,
            estimatedMin=l.estimated_min,
            estimatedMax=l.estimated_max,
            status=l.status,
            imageName=l.image_name,
            imageKey=l.image_key,
            aiConfidence=l.ai_confidence,
            clusterJoined=bool(l.cluster_id),
            clusterId=l.cluster_id,
            selectedRecyclerId=l.recycler_id,
            lockedRate=l.locked_rate,
            fairLockId=l.fairlock_id,
            validUntil=l.valid_until,
            pickupDate=l.pickup_date,
            finalWeight=l.final_weight,
            finalRate=l.final_rate,
            paymentStatus=l.payment_status,
            handoverCode=l.handover_code,
            passportId=l.passport_id,
            completedAt=l.completed_at,
            priceChangeReason=l.price_change_reason,
            recyclerRating=l.recycler_rating,
            recyclerReview=l.recycler_review
        ) for l in lots
    ]
