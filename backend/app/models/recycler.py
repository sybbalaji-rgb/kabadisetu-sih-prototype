from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from backend.app.database import Base

class MaterialPrice(Base):
    __tablename__ = "material_prices"

    material = Column(String, primary_key=True) # cables, batteries, pcb, panels, motors, plastics
    low_rate = Column(Float, nullable=False)
    high_rate = Column(Float, nullable=False)
    source = Column(String, nullable=False)
    updated_by = Column(String, nullable=True)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(String, primary_key=True)
    material = Column(String, nullable=False)
    low_rate = Column(Float, nullable=False)
    high_rate = Column(Float, nullable=False)
    source = Column(String, nullable=False)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
