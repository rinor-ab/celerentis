"""LLM-powered content writer for generating slide content."""

import json


import os
from typing import List, Dict, Any, Optional
from openai import OpenAI

# Use absolute imports
from packages.core.models.slide import SlideDef, SlideDraft
from packages.core.models.document import DocumentBundle
from packages.core.models.financials import FinancialsData


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
    
    # Group slides by type to reduce API calls
    slide_groups = _group_slides_by_type(slide_defs)
    
    slide_drafts = []
    
    for slide_type, slides in slide_groups.items():
        try:
            # Generate content for all slides of this type in one API call
            group_drafts = _generate_group_content(client, slides, slide_type, company_name, website, document_bundle, financials)
            slide_drafts.extend(group_drafts)
        except Exception as e:
            print(f"Error generating content for slide group {slide_type}: {e}")
            # Create fallback content for each slide in the group
            for slide_def in slides:
                fallback_draft = _create_fallback_draft(slide_def, company_name)
                slide_drafts.append(fallback_draft)
    
    return slide_drafts


def _group_slides_by_type(slide_defs: List[SlideDef]) -> Dict[str, List[SlideDef]]:
    """Group slides by their type to reduce API calls."""
    groups = {}
    
    for slide_def in slide_defs:
        slide_type = _determine_slide_type(slide_def.title)
        if slide_type not in groups:
            groups[slide_type] = []
        groups[slide_type].append(slide_def)
    
    return groups


def _generate_group_content(
    client: OpenAI, 
    slides: List[SlideDef], 
    slide_type: str, 
    company_name: str, 
    website: str, 
    document_bundle: DocumentBundle, 
    financials: FinancialsData
) -> List[SlideDraft]:
    """Generate content for a group of similar slides in one API call."""
    
    # Create a concise context
    context = _create_concise_context(company_name, website, document_bundle, financials)
    
    # Build the prompt for multiple slides
    slide_titles = [slide.title for slide in slides]
    
    system_prompt = f"""You are a professional investment banking analyst. Generate concise, professional content for {len(slides)} slides about {company_name}.

Guidelines:
- Be concise and professional
- Avoid repetition across slides
- Focus on key investment highlights
- Use bullet points for clarity
- Each slide should have unique, relevant content

Output: JSON array with one object per slide:
[
  {{
    "slide_index": 0,
    "content": "Brief main content (1-2 sentences)",
    "bullet_points": ["Point 1", "Point 2", "Point 3"],
    "notes": "Brief presenter note"
  }}
]"""

    user_prompt = f"""Company: {company_name}
Website: {website}
Context: {context}

Generate content for these slides: {', '.join(slide_titles)}

Return JSON array with content for each slide. Make each slide unique and relevant to its title."""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800  # Reduced from 500 per slide to 800 for multiple slides
        )
        
        content = response.choices[0].message.content
        
        # Parse JSON response
        try:
            parsed = json.loads(content)
            slide_drafts = []
            
            for item in parsed:
                slide_draft = SlideDraft(
                    slide_index=item.get("slide_index", 0),
                    content=item.get("content", ""),
                    bullet_points=item.get("bullet_points", []),
                    notes=item.get("notes", ""),
                    slide_title=slides[item.get("slide_index", 0)].title if item.get("slide_index", 0) < len(slides) else "Unknown",
                    company_name=company_name,
                    website=website
                )
                slide_drafts.append(slide_draft)
            
            return slide_drafts
            
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return [_create_fallback_draft(slide, company_name) for slide in slides]
            
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return [_create_fallback_draft(slide, company_name) for slide in slides]


def _create_concise_context(company_name: str, website: str, document_bundle: DocumentBundle, financials: FinancialsData) -> str:
    """Create a concise context summary to reduce token usage."""
    context_parts = []
    
    # Company info
    context_parts.append(f"Company: {company_name}")
    if website:
        context_parts.append(f"Website: {website}")
    
    # Financial summary (concise)
    if financials and financials.series:
        latest_data = []
        for series in financials.series[:3]:  # Only first 3 series
            if series.data:
                latest_year, latest_value = series.data[-1]
                latest_data.append(f"{series.name}: {latest_value:,.0f} ({latest_year})")
        if latest_data:
            context_parts.append(f"Key Financials: {'; '.join(latest_data)}")
    
    # Document summary (concise)
    if document_bundle and document_bundle.chunks:
        key_insights = []
        for chunk in document_bundle.chunks[:3]:  # Only first 3 chunks
            if len(chunk.text) > 30:
                text = chunk.text.strip()
                if "." in text:
                    key_insights.append(text.split(".")[0] + ".")
                else:
                    key_insights.append(text[:80] + "...")
        if key_insights:
            context_parts.append(f"Key Insights: {' '.join(key_insights)}")
    
    return " | ".join(context_parts)





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
