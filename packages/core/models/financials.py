"""Financial data models."""

from typing import List, Tuple, Dict, Optional
from pydantic import BaseModel, Field


class FinancialSeries(BaseModel):
    """Financial time series data."""
    name: str  # e.g., "Revenue", "EBITDA"
    unit: str = "USD"  # Currency or unit
    data: List[Tuple[int, float]]  # (year, value) pairs
    sheet_name: Optional[str] = None
    range_name: Optional[str] = None  # Excel named range if applicable

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "name": "Revenue",
                "unit": "USD",
                "data": [(2020, 1000000), (2021, 1500000), (2022, 2200000)],
                "sheet_name": "Financials",
                "range_name": "Revenue_Series"
            }
        }


class FinancialsData(BaseModel):
    """Complete financial data from Excel."""
    series: List[FinancialSeries]
    company_name: Optional[str] = None
    fiscal_year_end: Optional[str] = None  # e.g., "December 31"
    
    def get_series(self, name: str) -> Optional[FinancialSeries]:
        """Get financial series by name."""
        for series in self.series:
            if series.name.lower() == name.lower():
                return series
        return None
    
    def get_latest_value(self, name: str) -> Optional[float]:
        """Get latest value for a series."""
        series = self.get_series(name)
        if series and series.data:
            return max(series.data, key=lambda x: x[0])[1]
        return None
