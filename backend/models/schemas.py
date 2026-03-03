from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ScanResult(BaseModel):
    heart_rate: float
    stress: float
    fatigue: float
    blood_flow: str
    health_score: float
    confidence: float
    timestamp: Optional[datetime] = None

class Doctor(BaseModel):
    name: str
    specialization: str
    designation: str
    hospital: str
    location: str
    available_time: str
    booking_url: str
