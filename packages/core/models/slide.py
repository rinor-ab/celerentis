"""Slide models for template analysis and generation."""

from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class ChartToken(BaseModel):
    """Chart token placeholder in template."""
    token: str  # e.g., "{{CHART:Revenue}}"
    chart_type: str  # e.g., "Revenue"
    bbox: Tuple[float, float, float, float]  # left, top, width, height
    slide_index: int


class SlideDef(BaseModel):
    """Slide definition from template analysis."""
    slide_index: int
    title: str
    tokens: List[str]  # e.g., ["{{COMPANY_NAME}}", "{{TAGLINE}}"]
    chart_tokens: List[ChartToken]
    style_sample: str  # Text sample for style matching


class SlideDraft(BaseModel):
    """Generated slide content."""
    slide_index: int
    title: str
    bullets: List[str] = Field(..., min_items=3, max_items=5)
    notes: Optional[str] = None
    sources: List[str] = Field(default_factory=list)

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "slide_index": 0,
                "title": "Company Overview",
                "bullets": [
                    "Leading provider of AI-powered financial analytics",
                    "Established in 2020 with headquarters in San Francisco",
                    "Team of 25+ experienced data scientists and engineers"
                ],
                "notes": "Verify employee count and founding date",
                "sources": ["Company website", "LinkedIn company page"]
            }
        }


class TemplateAnalysis(BaseModel):
    """Result of template analysis."""
    slide_defs: List[SlideDef]
    style_map: dict[str, str]  # token -> style sample
    chart_tokens: List[ChartToken]
