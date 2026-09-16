from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from backend.app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True)
    role = Column(String, nullable=False) # 'collector', 'recycler', 'authority'
    display_name = Column(String, nullable=False)
    contact = Column(String, nullable=False, index=True)
    authorization_id = Column(String, nullable=True)
    service_area = Column(String, default="")
    verified = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
