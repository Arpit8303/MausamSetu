from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class SystemHealthResponse(BaseModel):
    status: str
    database: str
    active_model: str
    demo_mode: bool
    ingestion_status: str
    uptime_seconds: float
    total_users: int
    total_panchayats: int
    active_alerts: int

class IngestionLogSchema(BaseModel):
    id: int
    provider_name: str
    records_processed: int
    status: str
    message: Optional[str] = None
    executed_at: datetime

    class Config:
        from_attributes = True

class AuditLogSchema(BaseModel):
    id: int
    user_email: str
    action: str
    details: Optional[str] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True
