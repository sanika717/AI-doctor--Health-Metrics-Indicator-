from fastapi import APIRouter, HTTPException
from models.schemas import ScanResult
from database.mongo import get_db
from datetime import datetime
from bson import ObjectId

router = APIRouter()

def doc_to_scan(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("/save")
async def save_scan(scan: ScanResult):
    db = get_db()
    data = scan.dict()
    data["timestamp"] = datetime.utcnow()
    result = await db.scans.insert_one(data)
    return {"id": str(result.inserted_id), "message": "Scan saved"}

@router.get("/latest")
async def get_latest():
    db = get_db()
    doc = await db.scans.find_one(sort=[("timestamp", -1)])
    if not doc:
        raise HTTPException(status_code=404, detail="No scans found")
    return doc_to_scan(doc)

@router.get("/{scan_id}")
async def get_scan(scan_id: str):
    db = get_db()
    try:
        doc = await db.scans.find_one({"_id": ObjectId(scan_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc_to_scan(doc)
