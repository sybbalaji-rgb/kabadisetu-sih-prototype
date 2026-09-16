from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.scrap import Lot, ClusterMember
from backend.app.models.user import Profile

router = APIRouter(prefix="/pickup", tags=["Smart Cluster Logistics"])

@router.post("/cluster/join")
def join_cluster(profileId: str, lotId: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lotId, Lot.collector_id == profileId).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
        
    cluster_id = f"CLU-{lot.material.upper()[:3]}-{lot.location.split(',')[0].strip().upper()}"
    lot.cluster_id = cluster_id
    
    existing_mem = db.query(ClusterMember).filter(ClusterMember.lot_id == lotId).first()
    if not existing_mem:
        db.add(ClusterMember(lot_id=lotId, cluster_id=cluster_id))
        
    db.commit()
    return {"status": "success", "lotId": lotId, "clusterId": cluster_id}

@router.post("/cluster/leave")
def leave_cluster(profileId: str, lotId: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lotId, Lot.collector_id == profileId).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
        
    lot.cluster_id = None
    mem = db.query(ClusterMember).filter(ClusterMember.lot_id == lotId).first()
    if mem:
        db.delete(mem)
    db.commit()
    return {"status": "success", "lotId": lotId}
