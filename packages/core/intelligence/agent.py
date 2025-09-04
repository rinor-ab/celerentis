"""Swiss SME company intelligence agent for M&A/PE work."""

import os
import re
import json
import requests
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse
import logging

from .models import (
    SwissCompanyData, CompanyIntelligenceData, Metadata, Identitaet, 
    Klassifikation, Marktanalyse, Organisation, Gesellschaftsstruktur,
    Finanzen, NewsTimeline, DealKontext, Quelle, Diskrepanz
)
from .swiss_registers import SwissRegisterScraper, WebScraper

logger = logging.getLogger(__name__)


class SwissCompanyIntelligenceAgent:
    """Swiss SME company intelligence agent for M&A/PE work."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; SwissCompanyIntelligence/1.0)'
        })
        self.sources = []
        self.source_counter = 1
        self.register_scraper = SwissRegisterScraper()
        self.web_scraper = WebScraper()
        
    def analyze_company(
        self,
        company_query: str,
        country_hint: str = "Switzerland",
        official_domain: Optional[str] = None,
        base_currency: str = "CHF",
        output_language: str = "de-CH",
        attachments: Optional[List[Dict]] = None
    ) -> CompanyIntelligenceData:
        """
        Analyze a Swiss company and return comprehensive intelligence data.
        
        Args:
            company_query: Company name to analyze
            country_hint: Country hint (default: Switzerland)
            official_domain: Official company domain
            base_currency: Base currency (default: CHF)
            output_language: Output language (de-CH or en)
            attachments: Optional attachments to analyze
            
        Returns:
            CompanyIntelligenceData with JSON and Markdown brief
        """
        logger.info(f"Starting analysis for company: {company_query}")
        
        # Initialize data structure
        company_data = self._initialize_company_data(
            company_query, official_domain, base_currency, output_language
        )
        
        # Step 1: Verify company and get basic identity
        self._verify_company_identity(company_data, company_query, official_domain)
        
        # Step 2: Extract from Swiss registers
        if country_hint == "Switzerland":
            self._extract_from_swiss_registers(company_data)
        
        # Step 3: Extract from company website
        if company_data.metadata.official_domain:
            self._extract_from_company_website(company_data)
        
        # Step 4: Extract from attachments
        if attachments:
            self._extract_from_attachments(company_data, attachments)
        
        # Step 5: Web search for additional information
        self._web_search_company_info(company_data)
        
        # Step 6: Generate USPs and risk analysis
        self._analyze_usps_and_risks(company_data)
        
        # Step 7: Generate markdown brief
        markdown_brief = self._generate_markdown_brief(company_data)
        
        # Step 8: Calculate overall confidence
        company_data.confidence_overall = self._calculate_confidence(company_data)
        
        logger.info(f"Analysis completed with confidence: {company_data.confidence_overall}")
        
        return CompanyIntelligenceData(
            json_data=company_data,
            markdown_brief=markdown_brief
        )
    
    def _initialize_company_data(
        self, 
        company_query: str, 
        official_domain: Optional[str], 
        base_currency: str, 
        output_language: str
    ) -> SwissCompanyData:
        """Initialize the company data structure."""
        return SwissCompanyData(
            metadata=Metadata(
                company_query=company_query,
                resolved_legal_name=company_query,
                official_domain=official_domain,
                country="Switzerland",
                base_currency=base_currency,
                output_language=output_language,
                last_updated_utc=datetime.now(timezone.utc).isoformat()
            ),
            identitaet=Identitaet(rechtlicher_name=company_query),
            klassifikation=Klassifikation(kurzbeschreibung=""),
            marktanalyse=Marktanalyse(),
            organisation=Organisation(),
            gesellschaftsstruktur=Gesellschaftsstruktur(),
            finanzen=Finanzen(),
            deal_kontext=DealKontext()
        )
    
    def _verify_company_identity(self, company_data: SwissCompanyData, company_query: str, official_domain: Optional[str]):
        """Verify company identity and get basic information."""
        logger.info("Verifying company identity...")
        
        # Try to find official domain if not provided
        if not official_domain:
            official_domain = self._find_official_domain(company_query)
            company_data.metadata.official_domain = official_domain
        
        # Search for company on LinkedIn
        linkedin_url = self._find_linkedin_company(company_query)
        if linkedin_url:
            company_data.identitaet.social.linkedin = linkedin_url
            self._add_source("web", f"LinkedIn Company Page", linkedin_url)
        
        # Basic web search for company verification
        search_results = self._web_search(f'"{company_query}" (AG|GmbH|SA|Ltd|Inc) site:linkedin.com/company')
        if search_results:
            self._add_source("web", "LinkedIn Search Results", search_results[0].get('url', ''))
    
    def _extract_from_swiss_registers(self, company_data: SwissCompanyData):
        """Extract information from Swiss registers."""
        logger.info("Extracting from Swiss registers...")
        
        company_name = company_data.identitaet.rechtlicher_name
        
        # Search ZEFIX/UID registry
        self._search_zefix_registry(company_data, company_name)
        
        # Search SHAB (SOGC) announcements
        self._search_shab_announcements(company_data, company_name)
        
        # Search cantonal Handelsregister
        self._search_handelsregister(company_data, company_name)
    
    def _search_zefix_registry(self, company_data: SwissCompanyData, company_name: str):
        """Search ZEFIX registry for company information."""
        try:
            logger.info(f"Searching ZEFIX for: {company_name}")
            
            # Use the register scraper
            zefix_data = self.register_scraper.search_zefix(company_name)
            
            if zefix_data:
                # Update company data with ZEFIX information
                if 'uid' in zefix_data:
                    company_data.identitaet.registrierung.uid = zefix_data['uid']
                
                if 'mwst' in zefix_data:
                    company_data.identitaet.registrierung.mwst = zefix_data['mwst']
                
                if 'legal_name' in zefix_data:
                    company_data.identitaet.rechtlicher_name = zefix_data['legal_name']
                    company_data.metadata.resolved_legal_name = zefix_data['legal_name']
                
                if 'address' in zefix_data:
                    company_data.identitaet.adresse_hq = zefix_data['address']
                
                if 'founding_date' in zefix_data:
                    company_data.identitaet.gruendungsdatum = zefix_data['founding_date']
                
                self._add_source("register", "ZEFIX UID Registry", "https://www.uid.admin.ch")
            
        except Exception as e:
            logger.error(f"Error searching ZEFIX: {e}")
    
    def _search_shab_announcements(self, company_data: SwissCompanyData, company_name: str):
        """Search SHAB announcements."""
        try:
            # SHAB search (this would need to be adapted to actual SHAB API)
            search_url = f"https://www.shab.ch/search?q={company_name}"
            logger.info(f"Searching SHAB for: {company_name}")
            
            # Simulate finding announcements
            # In real implementation, parse SHAB XML/HTML responses
            self._add_source("register", "SHAB Announcements", search_url)
            
        except Exception as e:
            logger.error(f"Error searching SHAB: {e}")
    
    def _search_handelsregister(self, company_data: SwissCompanyData, company_name: str):
        """Search cantonal Handelsregister."""
        try:
            # Cantonal register search
            search_url = f"https://www.handelsregister.ch/search?q={company_name}"
            logger.info(f"Searching Handelsregister for: {company_name}")
            
            # Simulate finding register entries
            self._add_source("register", "Cantonal Handelsregister", search_url)
            
        except Exception as e:
            logger.error(f"Error searching Handelsregister: {e}")
    
    def _extract_from_company_website(self, company_data: SwissCompanyData):
        """Extract information from company website."""
        logger.info(f"Extracting from company website: {company_data.metadata.official_domain}")
        
        domain = company_data.metadata.official_domain
        if not domain:
            return
        
        # Use the web scraper
        website_data = self.web_scraper.scrape_company_website(domain)
        
        if website_data:
            # Update company data with website information
            if 'contact' in website_data:
                contact = website_data['contact']
                if 'phone' in contact:
                    company_data.identitaet.kontakte.telefon = contact['phone']
                if 'email' in contact:
                    company_data.identitaet.kontakte.email_generisch = contact['email']
                if 'address' in contact:
                    company_data.identitaet.adresse_hq = contact['address']
            
            if 'about' in website_data:
                about = website_data['about']
                if 'description' in about:
                    company_data.klassifikation.kurzbeschreibung = about['description']
            
            if 'products' in website_data:
                products = website_data['products']
                if 'products' in products:
                    # Add products to the company data
                    for product_name in products['products'][:5]:  # Limit to 5 products
                        from .models import ProduktDienstleistung
                        company_data.produkte_dienstleistungen.append(
                            ProduktDienstleistung(
                                name=product_name,
                                beschreibung=f"Product: {product_name}",
                                usps=[],
                                zertifizierungen=[]
                            )
                        )
                
                if 'certifications' in products:
                    # Add certifications
                    for cert in products['certifications']:
                        from .models import ZertifizierungCompliance
                        company_data.zertifizierungen_compliance.append(
                            ZertifizierungCompliance(
                                standard=cert,
                                issuer="Unknown",
                                id_or_cert_no=None,
                                valid_through=None
                            )
                        )
            
            self._add_source("web", f"Company Website: {domain}", f"https://{domain}")
    
    def _extract_website_identity(self, company_data: SwissCompanyData, domain: str):
        """Extract identity information from website."""
        try:
            # Search for contact/impressum pages
            contact_urls = [
                f"https://{domain}/kontakt",
                f"https://{domain}/contact",
                f"https://{domain}/impressum",
                f"https://{domain}/about",
                f"https://{domain}/unternehmen"
            ]
            
            for url in contact_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        # Parse contact information
                        self._parse_contact_info(company_data, response.text, url)
                        self._add_source("web", f"Company Contact Page", url)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting website identity: {e}")
    
    def _extract_website_products(self, company_data: SwissCompanyData, domain: str):
        """Extract product/service information from website."""
        try:
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
                        # Parse product information
                        self._parse_products_info(company_data, response.text, url)
                        self._add_source("web", f"Company Products Page", url)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting website products: {e}")
    
    def _extract_website_organization(self, company_data: SwissCompanyData, domain: str):
        """Extract organization information from website."""
        try:
            org_urls = [
                f"https://{domain}/team",
                f"https://{domain}/management",
                f"https://{domain}/organisation",
                f"https://{domain}/about"
            ]
            
            for url in org_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        # Parse organization information
                        self._parse_organization_info(company_data, response.text, url)
                        self._add_source("web", f"Company Organization Page", url)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting website organization: {e}")
    
    def _extract_website_financials(self, company_data: SwissCompanyData, domain: str):
        """Extract financial information from website."""
        try:
            # Search for financial reports, press releases
            financial_urls = [
                f"https://{domain}/investor",
                f"https://{domain}/financials",
                f"https://{domain}/news",
                f"https://{domain}/presse"
            ]
            
            for url in financial_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        # Parse financial information
                        self._parse_financials_info(company_data, response.text, url)
                        self._add_source("web", f"Company Financial Page", url)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting website financials: {e}")
    
    def _extract_from_attachments(self, company_data: SwissCompanyData, attachments: List[Dict]):
        """Extract information from attachments."""
        logger.info(f"Extracting from {len(attachments)} attachments...")
        
        for attachment in attachments:
            try:
                file_type = attachment.get('type', '').lower()
                file_content = attachment.get('content', '')
                file_name = attachment.get('name', 'unknown')
                
                if file_type == 'pdf':
                    self._parse_pdf_attachment(company_data, file_content, file_name)
                elif file_type in ['docx', 'doc']:
                    self._parse_docx_attachment(company_data, file_content, file_name)
                elif file_type in ['pptx', 'ppt']:
                    self._parse_pptx_attachment(company_data, file_content, file_name)
                elif file_type in ['xlsx', 'xls']:
                    self._parse_xlsx_attachment(company_data, file_content, file_name)
                
                self._add_source("attachment", f"Attachment: {file_name}", f"file:{file_name}")
                
            except Exception as e:
                logger.error(f"Error processing attachment {attachment.get('name', 'unknown')}: {e}")
    
    def _web_search_company_info(self, company_data: SwissCompanyData):
        """Perform web searches for additional company information."""
        logger.info("Performing web searches for additional information...")
        
        company_name = company_data.identitaet.rechtlicher_name
        
        # Search for financial information
        financial_searches = [
            f'"{company_name}" (Umsatz|Revenue|Mitarbeitende|Employees)',
            f'"{company_name}" (ISO 9001|TÜV|Zertifikat)',
            f'"{company_name}" (Finanzbericht|Annual Report)'
        ]
        
        for search_query in financial_searches:
            results = self._web_search(search_query)
            if results:
                self._parse_search_results(company_data, results, search_query)
                self._add_source("web", f"Web Search: {search_query}", results[0].get('url', ''))
        
        # Search for competitors
        competitor_search = f'"{company_name}" competitors "ähnliche Unternehmen"'
        competitor_results = self._web_search(competitor_search)
        if competitor_results:
            self._parse_competitor_results(company_data, competitor_results)
            self._add_source("web", "Competitor Analysis", competitor_results[0].get('url', ''))
    
    def _analyze_usps_and_risks(self, company_data: SwissCompanyData):
        """Analyze USPs and risks based on collected data."""
        logger.info("Analyzing USPs and risks...")
        
        # Generate USPs based on collected data
        usps = []
        
        # Add USPs based on certifications
        if company_data.zertifizierungen_compliance:
            cert_names = [cert.standard for cert in company_data.zertifizierungen_compliance]
            if any('ISO' in cert for cert in cert_names):
                usps.append("ISO-zertifizierte Qualitätsstandards")
            if any('TÜV' in cert for cert in cert_names):
                usps.append("TÜV-zertifizierte Prozesse")
        
        # Add USPs based on market position
        if company_data.marktanalyse.wettbewerber:
            usps.append(f"Etablierte Marktposition mit {len(company_data.marktanalyse.wettbewerber)} identifizierten Wettbewerbern")
        
        # Add USPs based on financial stability
        if company_data.finanzen.historie:
            usps.append("Nachweisbare Finanzhistorie")
        
        company_data.usps = usps
        
        # Generate risks
        risks = []
        
        # Customer concentration risk
        if len(company_data.marktanalyse.schluesselkunden_public) < 3:
            risks.append("Potentielle Kundenkonzentration")
        
        # Market dependency risk
        if len(company_data.marktanalyse.endmaerkte) < 2:
            risks.append("Abhängigkeit von einzelnen Märkten")
        
        # Financial risk
        if not company_data.finanzen.historie:
            risks.append("Begrenzte öffentliche Finanzinformationen")
        
        company_data.risiken = risks
    
    def _generate_markdown_brief(self, company_data: SwissCompanyData) -> str:
        """Generate concise markdown brief."""
        brief_parts = []
        
        # Company description
        brief_parts.append(f"**Was sie tun:** {company_data.klassifikation.kurzbeschreibung}")
        
        # USPs
        if company_data.usps:
            usp_text = " • ".join(company_data.usps[:3])
            brief_parts.append(f"**USPs:** {usp_text}")
        
        # Scale
        scale_info = []
        if company_data.organisation.gesamt_headcount:
            scale_info.append(f"{company_data.organisation.gesamt_headcount} Mitarbeitende")
        if company_data.finanzen.historie:
            latest_year = max([h.jahr for h in company_data.finanzen.historie])
            latest_finance = next((h for h in company_data.finanzen.historie if h.jahr == latest_year), None)
            if latest_finance and latest_finance.umsatz:
                scale_info.append(f"Umsatz {latest_year}: {latest_finance.umsatz:,.0f} {latest_finance.waehrung}")
        if scale_info:
            brief_parts.append(f"**Skalierung:** {' • '.join(scale_info)}")
        
        # Markets & Certifications
        market_info = []
        if company_data.marktanalyse.endmaerkte:
            market_info.append(f"Märkte: {', '.join(company_data.marktanalyse.endmaerkte[:2])}")
        if company_data.zertifizierungen_compliance:
            cert_names = [cert.standard for cert in company_data.zertifizierungen_compliance[:2]]
            market_info.append(f"Zertifikate: {', '.join(cert_names)}")
        if market_info:
            brief_parts.append(f"**Märkte & Zertifikate:** {' • '.join(market_info)}")
        
        # Recent signals
        if company_data.news_timeline:
            recent_news = company_data.news_timeline[:3]
            signals = [news.titel for news in recent_news]
            brief_parts.append(f"**Signale (12-24 Monate):** {' • '.join(signals)}")
        
        # Risks & Opportunities
        risks_text = " • ".join(company_data.risiken[:3]) if company_data.risiken else "Begrenzte Risikoinformationen"
        opportunities_text = " • ".join(company_data.usps[:3]) if company_data.usps else "Starke Marktposition"
        brief_parts.append(f"**Risiken & Chancen:** {risks_text} | {opportunities_text}")
        
        # Sources
        source_refs = [f"[{source.id}]" for source in company_data.quellen[:5]]
        brief_parts.append(f"**Quellen:** {' '.join(source_refs)} gemäss quellen[]")
        
        return "\n\n".join(brief_parts)
    
    def _calculate_confidence(self, company_data: SwissCompanyData) -> float:
        """Calculate overall confidence score."""
        confidence_factors = []
        
        # Identity confidence
        if company_data.identitaet.registrierung.uid:
            confidence_factors.append(0.2)
        if company_data.metadata.official_domain:
            confidence_factors.append(0.15)
        if company_data.identitaet.social.linkedin:
            confidence_factors.append(0.1)
        
        # Financial confidence
        if company_data.finanzen.historie:
            confidence_factors.append(0.2)
        
        # Market confidence
        if company_data.marktanalyse.wettbewerber:
            confidence_factors.append(0.1)
        if company_data.produkte_dienstleistungen:
            confidence_factors.append(0.1)
        
        # Source confidence
        source_count = len(company_data.quellen)
        if source_count >= 5:
            confidence_factors.append(0.15)
        elif source_count >= 3:
            confidence_factors.append(0.1)
        else:
            confidence_factors.append(0.05)
        
        return min(sum(confidence_factors), 1.0)
    
    # Helper methods for parsing and searching
    def _find_official_domain(self, company_name: str) -> Optional[str]:
        """Find official company domain."""
        try:
            search_results = self._web_search(f'"{company_name}" official site | Kontakt | Impressum')
            if search_results:
                # Extract domain from first result
                url = search_results[0].get('url', '')
                parsed = urlparse(url)
                return parsed.netloc
        except Exception as e:
            logger.error(f"Error finding official domain: {e}")
        return None
    
    def _find_linkedin_company(self, company_name: str) -> Optional[str]:
        """Find LinkedIn company page."""
        try:
            search_results = self._web_search(f'"{company_name}" site:linkedin.com/company')
            if search_results:
                return search_results[0].get('url', '')
        except Exception as e:
            logger.error(f"Error finding LinkedIn company: {e}")
        return None
    
    def _web_search(self, query: str) -> List[Dict]:
        """Perform web search (placeholder - would integrate with actual search API)."""
        # This is a placeholder - in real implementation, you would use:
        # - Google Custom Search API
        # - Bing Search API
        # - DuckDuckGo API
        # - Or other search services
        
        logger.info(f"Web search: {query}")
        return []
    
    def _parse_contact_info(self, company_data: SwissCompanyData, html_content: str, url: str):
        """Parse contact information from HTML."""
        # Extract phone, email, address from HTML
        # This would use BeautifulSoup or similar in real implementation
        pass
    
    def _parse_products_info(self, company_data: SwissCompanyData, html_content: str, url: str):
        """Parse product information from HTML."""
        # Extract products/services from HTML
        pass
    
    def _parse_organization_info(self, company_data: SwissCompanyData, html_content: str, url: str):
        """Parse organization information from HTML."""
        # Extract team/management info from HTML
        pass
    
    def _parse_financials_info(self, company_data: SwissCompanyData, html_content: str, url: str):
        """Parse financial information from HTML."""
        # Extract financial data from HTML
        pass
    
    def _parse_pdf_attachment(self, company_data: SwissCompanyData, content: str, filename: str):
        """Parse PDF attachment."""
        # Extract information from PDF content
        pass
    
    def _parse_docx_attachment(self, company_data: SwissCompanyData, content: str, filename: str):
        """Parse DOCX attachment."""
        # Extract information from DOCX content
        pass
    
    def _parse_pptx_attachment(self, company_data: SwissCompanyData, content: str, filename: str):
        """Parse PPTX attachment."""
        # Extract information from PPTX content
        pass
    
    def _parse_xlsx_attachment(self, company_data: SwissCompanyData, content: str, filename: str):
        """Parse XLSX attachment."""
        # Extract information from XLSX content
        pass
    
    def _parse_search_results(self, company_data: SwissCompanyData, results: List[Dict], query: str):
        """Parse web search results."""
        # Extract relevant information from search results
        pass
    
    def _parse_competitor_results(self, company_data: SwissCompanyData, results: List[Dict]):
        """Parse competitor search results."""
        # Extract competitor information
        pass
    
    def _add_source(self, source_type: str, title: str, url_or_file: str):
        """Add a source to the sources list."""
        source_id = f"S{self.source_counter}"
        self.source_counter += 1
        
        source = Quelle(
            id=source_id,
            typ=source_type,
            titel=title,
            url_or_file=url_or_file,
            accessed_utc=datetime.now(timezone.utc).isoformat()
        )
        
        self.sources.append(source)
