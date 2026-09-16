from sqlalchemy import Column, String, ForeignKey
from datetime import datetime
from backend.app.database import Base

class PassportEvent(Base):
    __tablename__ = "passport_events"

    id = Column(String, primary_key=True)
    passport_id = Column(String, nullable=False, index=True)
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    event_type = Column(String, nullable=False) # lot_created, fairlock_assigned, verified_handover
    actor_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    details = Column(String, nullable=False) # JSON metadata string
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
