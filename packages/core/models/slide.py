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
    """Generated slide content draft."""
    slide_index: int
    content: str
    bullet_points: List[str]
    notes: str
    slide_title: str
    company_name: str = ""
    website: str = ""


class TemplateAnalysis(BaseModel):
    """Result of template analysis."""
    slide_defs: List[SlideDef]
    style_map: dict[str, str]  # token -> style sample
    chart_tokens: List[ChartToken]
