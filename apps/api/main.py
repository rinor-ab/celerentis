"""FastAPI application for Celerentis API."""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
from datetime import datetime
import os

# Import models directly from the core package
import sys
sys.path.append('/app/packages/core')
from models import JobCreate, JobResponse, JobStatus
from utils.s3_client import S3Client
from utils.logo_fetcher import fetch_company_logo
from ingest.financials import parse_financials
from ingest.bundle import parse_bundle
from ppt.template_analyzer import analyze_template
from llm.writer import write_section_texts
from ppt.builder import build_deck

# Import worker task
from worker import create_im_generation_task

app = FastAPI(
    title="Celerentis API",
    description="AI IM Generator API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize S3 client
s3_client = S3Client()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Celerentis API is running", "version": "1.0.0"}


@app.get("/jobs", response_model=list[JobResponse])
async def list_jobs():
    """List all jobs."""
    try:
        # In a real app, this would query the database
        # For now, we'll check S3 for all job directories and their status
        
        # Get list of all job directories from S3
        job_dirs = s3_client.list_job_directories()
        
        jobs = []
        for job_id in job_dirs:
            try:
                # Check if job has output file (completed)
                output_key = f"jobs/{job_id}/output.pptx"
                if s3_client.file_exists(output_key):
                    download_url = s3_client.get_presigned_url(output_key)
                    status = JobStatus.DONE
                    message = "IM generation complete"
                else:
                    # Check if template exists (job created but not completed)
                    template_key = f"jobs/{job_id}/template.pptx"
                    if s3_client.file_exists(template_key):
                        status = JobStatus.RUNNING
                        message = "Processing IM generation..."
                        download_url = None
                    else:
                        continue  # Skip invalid job directories
                
                # For now, use placeholder company name (would come from DB in real app)
                job = JobResponse(
                    id=job_id,
                    company_name=f"Company {job_id[:8]}",  # Would come from DB
                    website=None,
                    status=status,
                    message=message,
                    download_url=download_url,
                    created_at=datetime.utcnow(),  # Would come from DB
                    updated_at=datetime.utcnow()
                )
                jobs.append(job)
                
            except Exception as e:
                print(f"Error processing job {job_id}: {e}")
                continue
        
        # Sort by creation date (newest first)
        jobs.sort(key=lambda x: x.created_at, reverse=True)
        
        return jobs
        
    except Exception as e:
        print(f"Error listing jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list jobs: {str(e)}")


@app.post("/jobs", response_model=JobResponse)
async def create_job(
    company_name: str = Form(...),
    website: Optional[str] = Form(None),
    pull_public_data: bool = Form(True),
    template: UploadFile = File(...),
    financials: Optional[UploadFile] = File(None),
    bundle: Optional[UploadFile] = File(None)
):
    """
    Create a new IM generation job.
    
    Args:
        company_name: Company name
        website: Company website (optional)
        pull_public_data: Whether to fetch public data
        template: PowerPoint template file
        financials: Excel financials file (optional)
        bundle: ZIP bundle of documents (optional)
    """
    try:
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Validate file types
        if not template.filename.endswith('.pptx'):
            raise HTTPException(status_code=400, detail="Template must be a PowerPoint file (.pptx)")
        
        if financials and not financials.filename.endswith('.xlsx'):
            raise HTTPException(status_code=400, detail="Financials must be an Excel file (.xlsx)")
        
        if bundle and not bundle.filename.endswith('.zip'):
            raise HTTPException(status_code=400, detail="Bundle must be a ZIP file (.zip)")
        
        # Upload files to S3
        template_key = f"jobs/{job_id}/template.pptx"
        template_bytes = await template.read()
        
        if not s3_client.upload_bytes(template_bytes, template_key, "application/vnd.openxmlformats-officedocument.presentationml.presentation"):
            raise HTTPException(status_code=500, detail="Failed to upload template file")
        
        # Upload optional files
        financials_key = None
        bundle_key = None
        
        if financials:
            financials_key = f"jobs/{job_id}/financials.xlsx"
            financials_bytes = await financials.read()
            if not s3_client.upload_bytes(financials_bytes, financials_key, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"):
                raise HTTPException(status_code=500, detail="Failed to upload financials file")
        
        if bundle:
            bundle_key = f"jobs/{job_id}/bundle.zip"
            bundle_bytes = await bundle.read()
            if not s3_client.upload_bytes(bundle_bytes, bundle_key, "application/zip"):
                raise HTTPException(status_code=500, detail="Failed to upload bundle file")
        
        # Create job record (in a real app, this would go to database)
        job_data = {
            "id": job_id,
            "company_name": company_name,
            "website": website,
            "pull_public_data": pull_public_data,
            "template_key": template_key,
            "financials_key": financials_key,
            "bundle_key": bundle_key,
            "status": JobStatus.QUEUED,
            "message": "Job queued for processing",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Enqueue worker task
        task = create_im_generation_task.delay(
            job_id=job_id,
            company_name=company_name,
            website=website,
            pull_public_data=pull_public_data,
            template_key=template_key,
            financials_key=financials_key,
            bundle_key=bundle_key
        )
        
        return JobResponse(
            id=job_id,
            company_name=company_name,
            website=website,
            status=JobStatus.QUEUED,
            message="Job queued for processing",
            download_url=None,
            created_at=job_data["created_at"],
            updated_at=job_data["updated_at"]
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error creating job: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")


@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """Get job status and details."""
    try:
        # In a real app, this would query the database
        # For now, we'll check S3 for the output file
        
        output_key = f"jobs/{job_id}/output.pptx"
        
        if s3_client.file_exists(output_key):
            # Job is complete
            download_url = s3_client.get_presigned_url(output_key)
            return JobResponse(
                id=job_id,
                company_name="Company Name",  # Would come from DB
                website=None,
                status=JobStatus.DONE,
                message="IM generation complete",
                download_url=download_url,
                created_at=datetime.utcnow(),  # Would come from DB
                updated_at=datetime.utcnow()
            )
        else:
            # Check if job is still processing
            # In a real app, this would check the database
            return JobResponse(
                id=job_id,
                company_name="Company Name",
                website=None,
                status=JobStatus.RUNNING,
                message="Processing IM generation...",
                download_url=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")


@app.get("/download/{job_id}")
async def get_download_url(job_id: str):
    """Get presigned download URL for completed IM."""
    try:
        output_key = f"jobs/{job_id}/output.pptx"
        
        if not s3_client.file_exists(output_key):
            raise HTTPException(status_code=404, detail="IM not found or not yet generated")
        
        download_url = s3_client.get_presigned_url(output_key)
        if not download_url:
            raise HTTPException(status_code=500, detail="Failed to generate download URL")
        
        return {"url": download_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get download URL: {str(e)}")


@app.post("/inspect-template")
async def inspect_template(template: UploadFile = File(...)):
    """Inspect template file and return structure analysis."""
    try:
        if not template.filename.endswith('.pptx'):
            raise HTTPException(status_code=400, detail="Template must be a PowerPoint file (.pptx)")
        
        template_bytes = await template.read()
        analysis = analyze_template(template_bytes)
        
        return {
            "tokens": list(analysis.style_map.keys()),
            "slide_defs": [
                {
                    "slide_index": slide.slide_index,
                    "title": slide.title,
                    "tokens": slide.tokens,
                    "chart_tokens": [
                        {
                            "token": chart.token,
                            "chart_type": chart.chart_type,
                            "slide_index": chart.slide_index
                        }
                        for chart in slide.chart_tokens
                    ]
                }
                for slide in analysis.slide_defs
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze template: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
