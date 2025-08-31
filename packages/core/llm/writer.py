"""LLM-powered content writer for generating slide content."""

import json


import os
from typing import List, Dict, Any, Optional
from openai import OpenAI

# Use absolute imports
from models.slide import SlideDef, SlideDraft
from models.document import DocumentBundle
from models.financials import FinancialsData


def write_section_texts(
    slide_defs: List[SlideDef],
    company_name: str,
    website: str,
    document_bundle: DocumentBundle,
    financials: FinancialsData
) -> List[SlideDraft]:
    """
    Generate slide content using LLM based on template and company data.
    
    Args:
        slide_defs: Template slide definitions
        company_name: Company name
        website: Company website
        document_bundle: Parsed document content
        financials: Financial data
        
    Returns:
        List of generated slide drafts
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    slide_drafts = []
    
    for slide_def in slide_defs:
        try:
            # Prepare context for this slide
            context = _prepare_slide_context(
                slide_def, company_name, website, document_bundle, financials
            )
            
            # Generate content using LLM
            slide_draft = _generate_slide_content(client, slide_def, context)
            
            if slide_draft:
                slide_drafts.append(slide_draft)
                
        except Exception as e:
            print(f"Error generating content for slide {slide_def.slide_index}: {e}")
            # Create fallback content
            fallback_draft = _create_fallback_draft(slide_def, company_name)
            slide_drafts.append(fallback_draft)
    
    return slide_drafts


def _prepare_slide_context(
    slide_def: SlideDef,
    company_name: str,
    website: str,
    document_bundle: DocumentBundle,
    financials: FinancialsData
) -> Dict[str, Any]:
    """Prepare context information for slide generation."""
    context = {
        "company_name": company_name,
        "website": website,
        "slide_title": slide_def.title,
        "slide_tokens": slide_def.tokens,
        "chart_tokens": [ct.token for ct in slide_def.chart_tokens],
        "financial_summary": _summarize_financials(financials),
        "document_summary": _summarize_documents(document_bundle),
        "slide_type": _determine_slide_type(slide_def.title)
    }
    
    return context


def _summarize_financials(financials: FinancialsData) -> str:
    """Create a summary of financial data."""
    if not financials.series:
        return "No financial data available"
    
    summary_parts = []
    for series in financials.series:
        if series.data:
            latest_year, latest_value = series.data[-1]
            summary_parts.append(f"{series.name}: {latest_value:,.0f} ({latest_year})")
    
    return "; ".join(summary_parts) if summary_parts else "Financial data available"


def _summarize_documents(document_bundle: DocumentBundle) -> str:
    """Create a summary of document content."""
    if not document_bundle.chunks:
        return "No additional documents provided"
    
    # Get key insights from documents
    key_phrases = []
    for chunk in document_bundle.chunks[:5]:  # First 5 chunks
        if len(chunk.text) > 50:
            # Extract first sentence or key phrase
            text = chunk.text.strip()
            if "." in text:
                key_phrases.append(text.split(".")[0] + ".")
            else:
                key_phrases.append(text[:100] + "...")
    
    return " ".join(key_phrases[:3]) if key_phrases else "Document content available"


def _determine_slide_type(title: str) -> str:
    """Determine the type of slide based on title."""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ["executive", "summary", "overview"]):
        return "executive_summary"
    elif any(word in title_lower for word in ["company", "about", "profile"]):
        return "company_profile"
    elif any(word in title_lower for word in ["market", "industry", "opportunity"]):
        return "market_analysis"
    elif any(word in title_lower for word in ["financial", "revenue", "growth"]):
        return "financial_analysis"
    elif any(word in title_lower for word in ["team", "management", "leadership"]):
        return "team_overview"
    elif any(word in title_lower for word in ["investment", "use of funds", "funding"]):
        return "investment_case"
    else:
        return "content_slide"


def _generate_slide_content(client: OpenAI, slide_def: SlideDef, context: Dict[str, Any]) -> SlideDraft:
    """Generate slide content using OpenAI API."""
    
    system_prompt = """You are a professional investment banking analyst creating content for an Information Memorandum (IM) presentation. 

Your task is to generate compelling, professional content for PowerPoint slides based on the provided context.

Guidelines:
- Use professional, investment banking language
- Be concise but informative
- Focus on key value propositions and investment highlights
- Use bullet points for clarity
- Maintain consistent tone across slides
- Include specific data points when available
- Avoid marketing language - be factual and analytical

Output format: JSON with the following structure:
{
    "content": "Main slide content (2-3 sentences)",
    "bullet_points": ["Key point 1", "Key point 2", "Key point 3"],
    "notes": "Additional context for presenter"
}"""

    user_prompt = f"""Generate content for a slide titled "{context['slide_title']}".

Company: {context['company_name']}
Website: {context['website']}
Slide Type: {context['slide_type']}

Financial Summary: {context['financial_summary']}
Document Insights: {context['document_summary']}

Template Tokens: {', '.join(context['slide_tokens']) if context['slide_tokens'] else 'None'}
Chart Placeholders: {', '.join(context['chart_tokens']) if context['chart_tokens'] else 'None'}

Generate professional, investment-focused content for this slide."""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        
        # Parse JSON response
        try:
            parsed = json.loads(content)
            return SlideDraft(
                slide_index=slide_def.slide_index,
                content=parsed.get("content", ""),
                bullet_points=parsed.get("bullet_points", []),
                notes=parsed.get("notes", ""),
                slide_title=slide_def.title,
                company_name=context["company_name"],
                website=context["website"]
            )
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return _create_fallback_draft(slide_def, context["company_name"])
            
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return _create_fallback_draft(slide_def, context["company_name"])


def _create_fallback_draft(slide_def: SlideDef, company_name: str) -> SlideDraft:
    """Create fallback content if LLM generation fails."""
    
    fallback_content = {
        "executive_summary": f"{company_name} represents a compelling investment opportunity in the market.",
        "company_profile": f"{company_name} is a leading company with strong market position and growth potential.",
        "market_analysis": f"The market presents significant opportunities for {company_name} to expand and grow.",
        "financial_analysis": f"{company_name} demonstrates strong financial performance and growth trajectory.",
        "team_overview": f"The management team at {company_name} brings extensive industry experience and proven track record.",
        "investment_case": f"Investment in {company_name} offers attractive returns with manageable risk profile."
    }
    
    slide_type = _determine_slide_type(slide_def.title)
    content = fallback_content.get(slide_type, f"{company_name} presents a strong investment opportunity.")
    
    bullet_points = [
        f"Strong market position in growing industry",
        f"Experienced management team with proven track record",
        f"Attractive financial metrics and growth potential"
    ]
    
    return SlideDraft(
        slide_index=slide_def.slide_index,
        content=content,
        bullet_points=bullet_points,
        notes="Fallback content generated due to LLM error",
        slide_title=slide_def.title,
        company_name=company_name,
        website=""
    )
