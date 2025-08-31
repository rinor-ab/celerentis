"""Document processing models."""

from typing import List, Optional
from pydantic import BaseModel, Field


class DocChunk(BaseModel):
    """Text chunk from document processing."""
    text: str
    doc_name: str
    page: Optional[int] = None
    chunk_index: int
    metadata: dict = Field(default_factory=dict)
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "text": "The company was founded in 2020 and has grown to serve over 500 clients...",
                "doc_name": "business_plan.pdf",
                "page": 3,
                "chunk_index": 0,
                "metadata": {"section": "Company Overview", "confidence": 0.95}
            }
        }


class DocumentBundle(BaseModel):
    """Collection of processed documents."""
    chunks: List[DocChunk]
    total_docs: int
    total_pages: int
    
    def search(self, query: str) -> List[DocChunk]:
        """Simple text search across chunks."""
        query_lower = query.lower()
        results = []
        for chunk in self.chunks:
            if query_lower in chunk.text.lower():
                results.append(chunk)
        return results
    
    def get_by_document(self, doc_name: str) -> List[DocChunk]:
        """Get all chunks from a specific document."""
        return [chunk for chunk in self.chunks if chunk.doc_name == doc_name]
