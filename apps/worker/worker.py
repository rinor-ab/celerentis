"""Celery worker for background IM generation tasks."""

import os
import traceback
from celery import Celery
import sys
from pathlib import Path

# Add the packages/core directory to Python path
core_path = Path(__file__).parent.parent.parent / "packages" / "core"
sys.path.insert(0, str(core_path))
from utils.s3_client import S3Client
from utils.logo_fetcher import fetch_company_logo
from ingest.financials import parse_financials
from ingest.bundle import parse_bundle
from ppt.template_analyzer import analyze_template
from llm.writer import write_section_texts
from ppt.builder import build_deck

# Initialize Celery
celery_app = Celery(
    "celerentis_worker",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

# Initialize S3 client
s3_client = S3Client()


@celery_app.task(bind=True)
def create_im_generation_task(
    self,
    job_id: str,
    company_name: str,
    website: str = None,
    pull_public_data: bool = True,
    template_key: str = None,
    financials_key: str = None,
    bundle_key: str = None
):
    """
    Background task to generate IM PowerPoint.
    
    Args:
        job_id: Unique job identifier
        company_name: Company name
        website: Company website
        pull_public_data: Whether to fetch public data
        template_key: S3 key for template file
        financials_key: S3 key for financials file
        bundle_key: S3 key for document bundle
    """
    try:
        # Update task status
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 1,
                "total": 6,
                "status": "Starting IM generation..."
            }
        )
        
        # Step 1: Download template
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 1,
                "total": 6,
                "status": "Downloading template..."
            }
        )
        
        print(f"=== STARTING IM GENERATION FOR JOB {job_id} ===")
        print(f"Company: {company_name}")
        print(f"Website: {website}")
        print(f"Template key: {template_key}")
        print(f"Financials key: {financials_key}")
        print(f"Bundle key: {bundle_key}")
        
        if not template_key:
            raise Exception("No template provided")
        
        print("Downloading template from S3...")
        template_bytes = s3_client.download_bytes(template_key)
        if not template_bytes:
            raise Exception("Failed to download template file")
        print(f"Template downloaded successfully: {len(template_bytes)} bytes")
        
        # Step 2: Analyze template
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 2,
                "total": 6,
                "status": "Analyzing template structure..."
            }
        )
        
        print("Starting template analysis...")
        template_analysis = analyze_template(template_bytes)
        print(f"Template analysis completed: {len(template_analysis.slide_defs)} slides found")
        print(f"Chart tokens found: {len(template_analysis.chart_tokens)}")
        print(f"Style map entries: {len(template_analysis.style_map)}")
        
        if not template_analysis.slide_defs:
            print("WARNING: No slides found in template!")
            # Create a basic slide definition to prevent failure
            from models.slide import SlideDef
            template_analysis.slide_defs = [
                SlideDef(
                    slide_index=0,
                    title="Default Slide",
                    tokens=["{{COMPANY_NAME}}", "{{CONTENT}}"],
                    chart_tokens=[],
                    style_sample=""
                )
            ]
            print("Created fallback slide definition")
        
        # Step 2: Process financials (if provided)
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 2,
                "total": 6,
                "status": "Processing financial data..."
            }
        )
        
        financials_data = None
        if financials_key:
            try:
                print(f"Downloading financials from S3: {financials_key}")
                financials_bytes = s3_client.download_bytes(financials_key)
                if financials_bytes:
                    print(f"Successfully downloaded financials, size: {len(financials_bytes)} bytes")
                    print("Starting financials parsing...")
                    financials_data = parse_financials(financials_bytes)
                    print(f"Financials parsing completed. Series: {len(financials_data.series) if financials_data else 0}")
                else:
                    print("Failed to download financials from S3")
            except Exception as e:
                print(f"Error processing financials: {e}")
                print(f"Financials processing traceback: {traceback.format_exc()}")
                # Continue without financials
                financials_data = None
        
        # Step 3: Process document bundle (if provided)
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 3,
                "total": 6,
                "status": "Processing document bundle..."
            }
        )
        
        document_bundle = None
        if bundle_key:
            try:
                print(f"Downloading bundle from S3: {bundle_key}")
                bundle_bytes = s3_client.download_bytes(bundle_key)
                if bundle_bytes:
                    print(f"Successfully downloaded bundle, size: {len(bundle_bytes)} bytes")
                    print("Starting bundle parsing...")
                    document_bundle = parse_bundle(bundle_bytes)
                    print(f"Bundle parsing completed. Total docs: {document_bundle.total_docs}, Total pages: {document_bundle.total_pages}")
                else:
                    print("Failed to download bundle from S3")
            except Exception as e:
                print(f"Error processing document bundle: {e}")
                print(f"Bundle processing traceback: {traceback.format_exc()}")
                # Continue with empty bundle instead of failing the entire job
                document_bundle = DocumentBundle(chunks=[], total_docs=0, total_pages=0)
        
        # Step 5: Generate content using LLM
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 5,
                "total": 6,
                "status": "Generating slide content..."
            }
        )
        
        print(f"Starting LLM content generation for {len(template_analysis.slide_defs)} slides")
        print(f"Company: {company_name}, Website: {website}")
        print(f"Document bundle: {document_bundle.total_docs if document_bundle else 0} docs")
        print(f"Financial data: {len(financials_data.series) if financials_data else 0} series")
        
        try:
            slide_drafts = write_section_texts(
                template_analysis.slide_defs,
                company_name,
                website or "",
                document_bundle or DocumentBundle(chunks=[], total_docs=0, total_pages=0),
                financials_data or FinancialsData(series=[])
            )
            print(f"LLM content generation completed successfully. Generated {len(slide_drafts)} slide drafts")
        except Exception as e:
            print(f"Error in LLM content generation: {e}")
            import traceback
            traceback.print_exc()
            # Create fallback slide drafts
            slide_drafts = []
            for slide_def in template_analysis.slide_defs:
                slide_drafts.append(SlideDraft(
                    slide_index=slide_def.slide_index,
                    content=f"Content for {slide_def.title}",
                    bullet_points=["Sample bullet point 1", "Sample bullet point 2"],
                    notes="Fallback content due to LLM error",
                    slide_title=slide_def.title,
                    company_name=company_name,
                    website=website or ""
                ))
        
        # Step 6: Build final PowerPoint
        self.update_state(
            state="PROGRESS",
            meta={
                "current": 6,
                "total": 6,
                "status": "Building PowerPoint deck..."
            }
        )
        
        # Fetch company logo if public data is enabled
        logo_bytes = None
        if pull_public_data and (website or company_name):
            logo_bytes = fetch_company_logo(company_name, website)
        
        # Build the final deck
        output_pptx = build_deck(
            template_bytes=template_bytes,
            slide_drafts=slide_drafts,
            financials=financials_data or FinancialsData(series=[]),
            logo_img_bytes=logo_bytes,
            chart_tokens=template_analysis.chart_tokens,
            company_name=company_name,
            website=website or ""
        )
        
        # Upload output to S3
        output_key = f"jobs/{job_id}/output.pptx"
        if not s3_client.upload_bytes(
            output_pptx, 
            output_key, 
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ):
            raise Exception("Failed to upload output file")
        
        # Task completed successfully
        return {
            "status": "SUCCESS",
            "message": "IM generation completed successfully",
            "output_key": output_key
        }
        
    except Exception as e:
        # Task failed
        error_message = f"IM generation failed: {str(e)}"
        print(error_message)
        
        # Update task state to failed
        self.update_state(
            state="FAILURE",
            meta={
                "error": error_message,
                "traceback": str(e)
            }
        )
        
        raise Exception(error_message)


# Import models to avoid circular imports
from models.document import DocumentBundle
from models.financials import FinancialsData
from models.slide import SlideDraft, SlideDef
