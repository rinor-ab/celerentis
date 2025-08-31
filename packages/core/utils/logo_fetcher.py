"""Logo fetching utility for company logos."""

import os
import requests
from typing import Optional
from urllib.parse import urlparse
import re


def fetch_company_logo(company_name: str, website: Optional[str] = None) -> Optional[bytes]:
    """
    Fetch company logo from various sources.
    
    Args:
        company_name: Company name to search for
        website: Company website (optional)
        
    Returns:
        Logo image bytes or None if not found
    """
    # Try website favicon first if available
    if website:
        logo_bytes = _fetch_favicon(website)
        if logo_bytes:
            return logo_bytes
    
    # Try logo API if configured
    logo_api_base = os.getenv("LOGO_API_BASE")
    if logo_api_base:
        logo_bytes = _fetch_from_logo_api(logo_api_base, company_name)
        if logo_bytes:
            return logo_bytes
    
    # Fallback to favicon from company name domain
    if company_name:
        logo_bytes = _fetch_favicon_from_name(company_name)
        if logo_bytes:
            return logo_bytes
    
    return None


def _fetch_favicon(website: str) -> Optional[bytes]:
    """Fetch favicon from a website."""
    try:
        # Ensure website has protocol
        if not website.startswith(('http://', 'https://')):
            website = 'https://' + website
        
        # Try common favicon paths
        favicon_paths = [
            '/favicon.ico',
            '/favicon.png',
            '/apple-touch-icon.png',
            '/logo.png',
            '/logo.jpg'
        ]
        
        for path in favicon_paths:
            try:
                url = website.rstrip('/') + path
                response = requests.get(url, timeout=10)
                if response.status_code == 200 and response.content:
                    # Check if it's actually an image
                    content_type = response.headers.get('content-type', '')
                    if 'image' in content_type:
                        return response.content
            except Exception:
                continue
        
        # Try to get favicon from HTML
        try:
            response = requests.get(website, timeout=10)
            if response.status_code == 200:
                html = response.text
                favicon_url = _extract_favicon_from_html(html, website)
                if favicon_url:
                    favicon_response = requests.get(favicon_url, timeout=10)
                    if favicon_response.status_code == 200:
                        return favicon_response.content
        except Exception:
            pass
            
    except Exception as e:
        print(f"Failed to fetch favicon from {website}: {e}")
    
    return None


def _extract_favicon_from_html(html: str, base_url: str) -> Optional[str]:
    """Extract favicon URL from HTML content."""
    # Look for favicon link tags
    favicon_patterns = [
        r'<link[^>]*rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]*href=["\']([^"\']+)["\']',
        r'<link[^>]*href=["\']([^"\']+\.ico)["\'][^>]*rel=["\']icon["\']',
    ]
    
    for pattern in favicon_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            favicon_path = match.group(1)
            
            # Handle relative URLs
            if favicon_path.startswith('/'):
                parsed_base = urlparse(base_url)
                return f"{parsed_base.scheme}://{parsed_base.netloc}{favicon_path}"
            elif favicon_path.startswith('http'):
                return favicon_path
            else:
                parsed_base = urlparse(base_url)
                return f"{parsed_base.scheme}://{parsed_base.netloc}/{favicon_path}"
    
    return None


def _fetch_favicon_from_name(company_name: str) -> Optional[bytes]:
    """Try to construct a domain from company name and fetch favicon."""
    try:
        # Simple domain construction (this is a fallback)
        # Convert company name to potential domain
        domain = _company_name_to_domain(company_name)
        if domain:
            return _fetch_favicon(domain)
    except Exception:
        pass
    
    return None


def _company_name_to_domain(company_name: str) -> Optional[str]:
    """Convert company name to potential domain."""
    # Remove common words and clean up
    clean_name = re.sub(r'\b(inc|corp|corporation|company|llc|ltd|limited|co)\b', '', company_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^\w\s]', '', clean_name)  # Remove punctuation
    clean_name = clean_name.strip().lower()
    
    # Convert spaces to dots or hyphens
    domain = re.sub(r'\s+', '.', clean_name)
    
    # Add common TLDs
    common_tlds = ['.com', '.org', '.net']
    
    for tld in common_tlds:
        try:
            test_domain = domain + tld
            # Try to resolve the domain
            import socket
            socket.gethostbyname(test_domain)
            return test_domain
        except socket.gaierror:
            continue
    
    return None


def _fetch_from_logo_api(api_base: str, company_name: str) -> Optional[bytes]:
    """Fetch logo from a logo API service."""
    try:
        # This is a generic implementation - specific APIs may have different endpoints
        url = f"{api_base}/logo/{company_name}"
        
        response = requests.get(url, timeout=10)
        if response.status_code == 200 and response.content:
            return response.content
            
    except Exception as e:
        print(f"Failed to fetch from logo API: {e}")
    
    return None


def validate_logo_image(image_bytes: bytes) -> bool:
    """Validate that the fetched bytes represent a valid image."""
    try:
        from PIL import Image
        from io import BytesIO
        
        img = Image.open(BytesIO(image_bytes))
        img.verify()  # Verify it's a valid image
        
        # Check reasonable dimensions
        img = Image.open(BytesIO(image_bytes))
        width, height = img.size
        
        # Logo should be reasonable size (not too small, not too large)
        if width < 16 or height < 16 or width > 1024 or height > 1024:
            return False
            
        return True
        
    except Exception:
        return False
