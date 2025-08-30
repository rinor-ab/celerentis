from __future__ import annotations

from pathlib import Path
from typing import List, Tuple

import yaml
from pydantic import BaseModel, Field, ValidationError, field_validator

class ChartSettings(BaseModel):
    title: str = "Revenue"
    xlabel: str = "Year"
    ylabel: str = "Value"
    placeholder_token: str = "{{CHART_PLACEHOLDER}}"

class AppConfig(BaseModel):
    company_name: str
    tagline: str
    about_bullets: List[str] = Field(default_factory=list)
    logo_path: Path
    financials: List[Tuple[int, float]]
    template_path: Path
    output_path: Path
    chart: ChartSettings = Field(default_factory=ChartSettings)

    @field_validator("financials")
    @classmethod
    def validate_financials(cls, v: List[Tuple[int, float]]) -> List[Tuple[int, float]]:
        if not v:
            raise ValueError("financials must contain at least one (year, value) pair")
        return v

def load_config(path: Path) -> AppConfig:
    """
    Load YAML config and return a validated AppConfig.
    Paths are resolved relative to the YAML file's parent for convenience.
    """
    raw = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    base = Path(path).parent

    # Normalise path-like fields
    for key in ("logo_path", "template_path", "output_path"):
        if key in raw:
            raw[key] = str((base / raw[key]).resolve())

    try:
        return AppConfig(**raw)
    except ValidationError as e:
        # Pretty error for CLI
        raise SystemExit(f"Config validation failed:\n{e}") from e

