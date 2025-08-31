"""Job models for IM generation."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Job status enumeration."""
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    ERROR = "error"


class Job(BaseModel):
    """Job model for IM generation."""
    id: UUID
    user_id: str
    company_name: str
    website: Optional[str] = None
    pull_public_data: bool = True
    template_key: str
    financials_key: Optional[str] = None
    bundle_key: Optional[str] = None
    status: JobStatus = JobStatus.QUEUED
    message: str = ""
    output_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    cost_cents: Optional[int] = None

    class Config:
        """Pydantic config."""
        from_attributes = True


class JobCreate(BaseModel):
    """Job creation request."""
    company_name: str = Field(..., min_length=1, max_length=200)
    website: Optional[str] = None
    pull_public_data: bool = True


class JobUpdate(BaseModel):
    """Job update request."""
    status: Optional[JobStatus] = None
    message: Optional[str] = None
    output_key: Optional[str] = None
    cost_cents: Optional[int] = None


class JobResponse(BaseModel):
    """Job response for API."""
    id: UUID
    company_name: str
    website: Optional[str] = None
    status: JobStatus
    message: str
    download_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
