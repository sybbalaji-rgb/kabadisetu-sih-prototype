import uuid
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.scrap import Lot
from backend.app.models.passport import PassportEvent
from backend.app.models.transaction import SupportRecord
from backend.app.schemas.transaction import (
    FairLockRequest,
    CompleteHandoverRequest,
    RateRecyclerRequest,
    SupportTicketRequest
)

router = APIRouter(prefix="/transaction", tags=["FairLock & Digital Material Passport"])

@router.post("/fairlock")
def lock_price(payload: FairLockRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == payload.lotId).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
        
    now = datetime.utcnow()
    valid_until = (now + timedelta(days=7)).isoformat()
    fairlock_id = f"FL-{str(uuid.uuid4())[:6].upper()}"
    
    lot.recycler_id = payload.profileId
    lot.locked_rate = payload.lockedRate
    lot.fairlock_id = fairlock_id
    lot.valid_until = valid_until
    lot.pickup_date = payload.pickupDate or (now + timedelta(days=2)).strftime("%Y-%m-%d")
    lot.status = "locked"
    lot.updated_at = now.isoformat()
    
    db.commit()
    return {
        "status": "success",
        "fairLockId": fairlock_id,
        "lockedRate": payload.lockedRate,
        "validUntil": valid_until
    }

@router.post("/handover")
def complete_handover(payload: CompleteHandoverRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == payload.lotId).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot.recycler_id != payload.profileId:
        raise HTTPException(status_code=403, detail="Only assigned recycler can finalize handover")
        
    rate_changed = lot.locked_rate is not None and float(lot.locked_rate) != payload.finalRate
    if rate_changed and not payload.priceChangeReason:
        raise HTTPException(status_code=400, detail="A reason is required when the final rate changes")
        
    now = datetime.utcnow().isoformat()
    passport_id = f"DMP-{str(uuid.uuid4())[:6].upper()}"
    handover_code = f"KBS-{str(uuid.uuid4())[:6].upper()}"
    
    lot.final_weight = payload.finalWeight
    lot.final_rate = payload.finalRate
    lot.payment_status = payload.paymentStatus
    lot.handover_code = handover_code
    lot.passport_id = passport_id
    lot.completed_at = now
    lot.price_change_reason = payload.priceChangeReason
    lot.status = "completed"
    lot.updated_at = now
    
    event_details = json.dumps({
        "material": lot.material,
        "finalWeight": payload.finalWeight,
        "finalRate": payload.finalRate,
        "paymentStatus": payload.paymentStatus,
        "fairLockId": lot.fairlock_id
    })
    
    event = PassportEvent(
        id=f"EVT-{str(uuid.uuid4())[:6].upper()}",
        passport_id=passport_id,
        lot_id=lot.id,
        event_type="verified_handover",
        actor_id=payload.profileId,
        details=event_details,
        created_at=now
    )
    db.add(event)
    db.commit()
    
    return {
        "status": "success",
        "lotId": lot.id,
        "passportId": passport_id,
        "handoverCode": handover_code,
        "finalWeight": payload.finalWeight,
        "finalRate": payload.finalRate
    }

@router.post("/rate")
def rate_recycler(payload: RateRecyclerRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == payload.lotId, Lot.collector_id == payload.profileId).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Completed lot not found")
        
    lot.recycler_rating = payload.rating
    lot.recycler_review = payload.review
    db.commit()
    return {"status": "success", "rating": payload.rating}

@router.post("/support")
def create_support_ticket(payload: SupportTicketRequest, db: Session = Depends(get_db)):
    ticket_id = f"KQ-{str(uuid.uuid4())[:6].upper()}"
    ticket = SupportRecord(
        id=ticket_id,
        profile_id=payload.profileId,
        kind=payload.kind,
        rating=payload.rating,
        message=payload.message,
        status="open",
        created_at=datetime.utcnow().isoformat()
    )
    db.add(ticket)
    db.commit()
    return {"status": "success", "ticketId": ticket_id}
