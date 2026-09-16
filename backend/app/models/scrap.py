from sqlalchemy import Column, String, Float, Integer, ForeignKey
from datetime import datetime
from backend.app.database import Base

class Lot(Base):
    __tablename__ = "lots"

    id = Column(String, primary_key=True, index=True)
    collector_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    material = Column(String, nullable=False, index=True) # cables, batteries, pcb, panels, motors, plastics
    weight = Column(Float, nullable=False)
    condition = Column(String, nullable=False) # Sorted, Mixed, Damaged
    location = Column(String, nullable=False)
    image_key = Column(String, nullable=True)
    image_name = Column(String, nullable=False)
    ai_confidence = Column(Float, default=0.0)
    estimated_min = Column(Float, nullable=False)
    estimated_max = Column(Float, nullable=False)
    status = Column(String, default="available", index=True) # available, locked, scheduled, completed
    
    # FairLock and Handover Details
    cluster_id = Column(String, nullable=True, index=True)
    recycler_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    locked_rate = Column(Float, nullable=True)
    fairlock_id = Column(String, nullable=True)
    valid_until = Column(String, nullable=True)
    pickup_date = Column(String, nullable=True)
    final_weight = Column(Float, nullable=True)
    final_rate = Column(Float, nullable=True)
    payment_status = Column(String, nullable=True) # paid, pending, partial
    handover_code = Column(String, nullable=True)
    passport_id = Column(String, nullable=True, index=True)
    completed_at = Column(String, nullable=True)
    price_change_reason = Column(String, nullable=True)
    recycler_rating = Column(Integer, nullable=True)
    recycler_review = Column(String, nullable=True)
    
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class ClusterMember(Base):
    __tablename__ = "cluster_members"

    lot_id = Column(String, primary_key=True)
    cluster_id = Column(String, nullable=False, index=True)
    joined_at = Column(String, default=lambda: datetime.utcnow().isoformat())
