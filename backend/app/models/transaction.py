from sqlalchemy import Column, String, Integer, ForeignKey
from datetime import datetime
from backend.app.database import Base

class SupportRecord(Base):
    __tablename__ = "support_records"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    kind = Column(String, nullable=False) # grievance, rate_dispute, general
    rating = Column(Integer, nullable=True)
    contact = Column(String, nullable=True)
    message = Column(String, nullable=False)
    status = Column(String, default="open") # open, in_progress, resolved
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
