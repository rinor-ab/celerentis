"""Swiss register scraping utilities."""

import re
import requests
from typing import Dict, List, Optional, Any
from urllib.parse import urlencode, quote
import logging

logger = logging.getLogger(__name__)


class SwissRegisterScraper:
    """Scraper for Swiss company registers."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; SwissCompanyIntelligence/1.0)'
        })
    
    def search_zefix(self, company_name: str) -> Dict[str, Any]:
        """Search ZEFIX registry for company information."""
        try:
            # ZEFIX search endpoint
            search_url = "https://www.uid.admin.ch/Detail.aspx"
            
            # Search parameters
            params = {
                'uid_id': company_name
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            
            if response.status_code == 200:
                return self._parse_zefix_response(response.text, company_name)
            else:
                logger.warning(f"ZEFIX search failed with status {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error searching ZEFIX: {e}")
            return {}
    
    def search_shab(self, company_name: str) -> List[Dict[str, Any]]:
        """Search SHAB announcements for company information."""
        try:
            # SHAB search endpoint
            search_url = "https://www.shab.ch/search"
            
            params = {
                'q': company_name,
                'type': 'all'
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            
            if response.status_code == 200:
                return self._parse_shab_response(response.text, company_name)
            else:
                logger.warning(f"SHAB search failed with status {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching SHAB: {e}")
            return []
    
    def search_handelsregister(self, company_name: str) -> List[Dict[str, Any]]:
        """Search cantonal Handelsregister for company information."""
        try:
            # Cantonal register search
            search_url = "https://www.handelsregister.ch/search"
            
            params = {
                'q': company_name
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            
            if response.status_code == 200:
                return self._parse_handelsregister_response(response.text, company_name)
            else:
                logger.warning(f"Handelsregister search failed with status {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching Handelsregister: {e}")
            return []
    
    def _parse_zefix_response(self, html_content: str, company_name: str) -> Dict[str, Any]:
        """Parse ZEFIX response HTML."""
        result = {}
        
        try:
            # Extract UID
            uid_pattern = r'CHE-\d{3}\.\d{3}\.\d{3}'
            uid_match = re.search(uid_pattern, html_content)
            if uid_match:
                result['uid'] = uid_match.group()
            
            # Extract VAT status
            mwst_pattern = r'CHE-\d{3}\.\d{3}\.\d{3}\s?MWST'
            mwst_match = re.search(mwst_pattern, html_content)
            if mwst_match:
                result['mwst'] = mwst_match.group()
            
            # Extract legal name
            name_pattern = r'<h1[^>]*>([^<]+)</h1>'
            name_match = re.search(name_pattern, html_content)
            if name_match:
                result['legal_name'] = name_match.group(1).strip()
            
            # Extract address
            address_pattern = r'Adresse[^>]*>([^<]+)</'
            address_match = re.search(address_pattern, html_content)
            if address_match:
                result['address'] = address_match.group(1).strip()
            
            # Extract founding date
            founding_pattern = r'Gründungsdatum[^>]*>([^<]+)</'
            founding_match = re.search(founding_pattern, html_content)
            if founding_match:
                result['founding_date'] = founding_match.group(1).strip()
            
        except Exception as e:
            logger.error(f"Error parsing ZEFIX response: {e}")
        
        return result
    
    def _parse_shab_response(self, html_content: str, company_name: str) -> List[Dict[str, Any]]:
        """Parse SHAB response HTML."""
        announcements = []
        
        try:
            # Extract announcement entries
            # This would need to be adapted based on actual SHAB HTML structure
            announcement_pattern = r'<div class="announcement"[^>]*>(.*?)</div>'
            matches = re.findall(announcement_pattern, html_content, re.DOTALL)
            
            for match in matches:
                announcement = {}
                
                # Extract date
                date_pattern = r'<span class="date"[^>]*>([^<]+)</span>'
                date_match = re.search(date_pattern, match)
                if date_match:
                    announcement['date'] = date_match.group(1).strip()
                
                # Extract title
                title_pattern = r'<h3[^>]*>([^<]+)</h3>'
                title_match = re.search(title_pattern, match)
                if title_match:
                    announcement['title'] = title_match.group(1).strip()
                
                # Extract summary
                summary_pattern = r'<p[^>]*>([^<]+)</p>'
                summary_match = re.search(summary_pattern, match)
                if summary_match:
                    announcement['summary'] = summary_match.group(1).strip()
                
                if announcement:
                    announcements.append(announcement)
            
        except Exception as e:
            logger.error(f"Error parsing SHAB response: {e}")
        
        return announcements
    
    def _parse_handelsregister_response(self, html_content: str, company_name: str) -> List[Dict[str, Any]]:
        """Parse Handelsregister response HTML."""
        entries = []
        
        try:
            # Extract register entries
            # This would need to be adapted based on actual Handelsregister HTML structure
            entry_pattern = r'<div class="register-entry"[^>]*>(.*?)</div>'
            matches = re.findall(entry_pattern, html_content, re.DOTALL)
            
            for match in matches:
                entry = {}
                
                # Extract company name
                name_pattern = r'<h3[^>]*>([^<]+)</h3>'
                name_match = re.search(name_pattern, match)
                if name_match:
                    entry['company_name'] = name_match.group(1).strip()
                
                # Extract UID
                uid_pattern = r'CHE-\d{3}\.\d{3}\.\d{3}'
                uid_match = re.search(uid_pattern, match)
                if uid_match:
                    entry['uid'] = uid_match.group()
                
                # Extract address
                address_pattern = r'<span class="address"[^>]*>([^<]+)</span>'
                address_match = re.search(address_pattern, match)
                if address_match:
                    entry['address'] = address_match.group(1).strip()
                
                # Extract legal form
                form_pattern = r'<span class="legal-form"[^>]*>([^<]+)</span>'
                form_match = re.search(form_pattern, match)
                if form_match:
                    entry['legal_form'] = form_match.group(1).strip()
                
                if entry:
                    entries.append(entry)
            
        except Exception as e:
            logger.error(f"Error parsing Handelsregister response: {e}")
        
        return entries


class WebScraper:
    """General web scraping utilities."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; SwissCompanyIntelligence/1.0)'
        })
    
    def scrape_company_website(self, domain: str) -> Dict[str, Any]:
        """Scrape company website for information."""
        result = {}
        
        try:
            # Scrape contact page
            contact_info = self._scrape_contact_page(domain)
            if contact_info:
                result['contact'] = contact_info
            
            # Scrape about page
            about_info = self._scrape_about_page(domain)
            if about_info:
                result['about'] = about_info
            
            # Scrape products page
            products_info = self._scrape_products_page(domain)
            if products_info:
                result['products'] = products_info
            
        except Exception as e:
            logger.error(f"Error scraping company website {domain}: {e}")
        
        return result
    
    def _scrape_contact_page(self, domain: str) -> Dict[str, Any]:
        """Scrape contact page for information."""
        contact_urls = [
            f"https://{domain}/kontakt",
            f"https://{domain}/contact",
            f"https://{domain}/impressum"
        ]
        
        for url in contact_urls:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    return self._parse_contact_page(response.text)
            except:
                continue
        
        return {}
    
    def _scrape_about_page(self, domain: str) -> Dict[str, Any]:
        """Scrape about page for information."""
        about_urls = [
            f"https://{domain}/about",
            f"https://{domain}/unternehmen",
            f"https://{domain}/company"
        ]
        
        for url in about_urls:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    return self._parse_about_page(response.text)
            except:
                continue
        
        return {}
    
    def _scrape_products_page(self, domain: str) -> Dict[str, Any]:
        """Scrape products page for information."""
        product_urls = [
            f"https://{domain}/produkte",
            f"https://{domain}/products",
            f"https://{domain}/solutions",
            f"https://{domain}/services"
        ]
        
        for url in product_urls:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    return self._parse_products_page(response.text)
            except:
                continue
        
        return {}
    
    def _parse_contact_page(self, html_content: str) -> Dict[str, Any]:
        """Parse contact page HTML."""
        result = {}
        
        # Extract phone number
        phone_pattern = r'(\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2})'
        phone_match = re.search(phone_pattern, html_content)
        if phone_match:
            result['phone'] = phone_match.group(1)
        
        # Extract email
        email_pattern = r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        email_match = re.search(email_pattern, html_content)
        if email_match:
            result['email'] = email_match.group(1)
        
        # Extract address
        address_pattern = r'<address[^>]*>(.*?)</address>'
        address_match = re.search(address_pattern, html_content, re.DOTALL)
        if address_match:
            result['address'] = re.sub(r'<[^>]+>', '', address_match.group(1)).strip()
        
        return result
    
    def _parse_about_page(self, html_content: str) -> Dict[str, Any]:
        """Parse about page HTML."""
        result = {}
        
        # Extract company description
        desc_pattern = r'<meta name="description" content="([^"]+)"'
        desc_match = re.search(desc_pattern, html_content)
        if desc_match:
            result['description'] = desc_match.group(1)
        
        # Extract team information
        team_pattern = r'<h[1-6][^>]*>(?:Team|Management|Führung)[^<]*</h[1-6]>(.*?)</div>'
        team_match = re.search(team_pattern, html_content, re.DOTALL | re.IGNORECASE)
        if team_match:
            result['team_info'] = re.sub(r'<[^>]+>', '', team_match.group(1)).strip()
        
        return result
    
    def _parse_products_page(self, html_content: str) -> Dict[str, Any]:
        """Parse products page HTML."""
        result = {}
        
        # Extract product names
        product_pattern = r'<h[1-6][^>]*>([^<]+)</h[1-6]>'
        products = re.findall(product_pattern, html_content)
        if products:
            result['products'] = products[:10]  # Limit to first 10 products
        
        # Extract certifications
        cert_pattern = r'(ISO\s?\d{4}|TÜV|CE|FDA)'
        certifications = re.findall(cert_pattern, html_content, re.IGNORECASE)
        if certifications:
            result['certifications'] = list(set(certifications))
        
        return result
