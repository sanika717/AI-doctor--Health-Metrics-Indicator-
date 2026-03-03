from fastapi import APIRouter, HTTPException
from database.mongo import get_db

router = APIRouter()

def doc_to_dict(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/")
async def get_all_doctors():
    db = get_db()
    docs = await db.doctors.find().to_list(length=200)
    return [doc_to_dict(d) for d in docs]

@router.get("/{specialization}")
async def get_by_spec(specialization: str):
    db = get_db()
    docs = await db.doctors.find({"specialization": {"$regex": specialization, "$options": "i"}}).to_list(100)
    if not docs:
        raise HTTPException(status_code=404, detail="No doctors found")
    return [doc_to_dict(d) for d in docs]
