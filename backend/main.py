from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scan, doctors, report
from database.mongo import init_db

app = FastAPI(title="AI Health Scanner API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(scan.router, prefix="/scan", tags=["scan"])
app.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
app.include_router(report.router, prefix="/report", tags=["report"])

@app.get("/")
async def root():
    return {"status": "AI Health Scanner API v2 running"}
