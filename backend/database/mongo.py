from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "ai_health_scanner"

client = None
db = None

async def init_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    count = await db.doctors.count_documents({})
    if count == 0:
        from database.seed import seed_doctors
        await seed_doctors(db)
    print(f"✅ Connected to MongoDB: {DB_NAME}")

def get_db():
    return db
