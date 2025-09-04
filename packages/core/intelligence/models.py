"""Data models for Swiss company intelligence."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ContactInfo(BaseModel):
    """Contact information."""
    telefon: Optional[str] = None
    email_generisch: Optional[str] = None
    kontakt_url: Optional[str] = None


class SocialMedia(BaseModel):
    """Social media presence."""
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    weitere: List[str] = Field(default_factory=list)


class Registration(BaseModel):
    """Company registration details."""
    uid: Optional[str] = None
    mwst: Optional[str] = None


class Identitaet(BaseModel):
    """Company identity information."""
    rechtlicher_name: str
    handelsnamen: List[str] = Field(default_factory=list)
    registrierung: Registration = Field(default_factory=Registration)
    gruendungsdatum: Optional[str] = None
    adresse_hq: Optional[str] = None
    kontakte: ContactInfo = Field(default_factory=ContactInfo)
    social: SocialMedia = Field(default_factory=SocialMedia)


class Klassifikation(BaseModel):
    """Business classification."""
    noga: Optional[str] = None
    nace: Optional[str] = None
    naics: Optional[str] = None
    kurzbeschreibung: str


class ProduktDienstleistung(BaseModel):
    """Product or service."""
    name: str
    beschreibung: str
    usps: List[str] = Field(default_factory=list)
    zertifizierungen: List[str] = Field(default_factory=list)


class Wettbewerber(BaseModel):
    """Competitor information."""
    name: str
    land: str
    notizen: str


class Marktanalyse(BaseModel):
    """Market analysis."""
    endmaerkte: List[str] = Field(default_factory=list)
    schluesselkunden_public: List[str] = Field(default_factory=list)
    geografien: List[str] = Field(default_factory=list)
    vertriebskanaele: List[str] = Field(default_factory=list)
    wettbewerber: List[Wettbewerber] = Field(default_factory=list)


class HeadcountNachFunktion(BaseModel):
    """Headcount by function."""
    funktion: str
    anzahl: Optional[int] = None


class Standort(BaseModel):
    """Company location."""
    name: str
    adresse: str
    rolle: str


class ITLandschaft(BaseModel):
    """IT landscape."""
    erp: Optional[str] = None
    crm: Optional[str] = None
    sonstige: List[str] = Field(default_factory=list)


class Organisation(BaseModel):
    """Organization structure."""
    gesamt_headcount: Optional[int] = None
    headcount_nach_funktion: List[HeadcountNachFunktion] = Field(default_factory=list)
    standorte: List[Standort] = Field(default_factory=list)
    it_landschaft: ITLandschaft = Field(default_factory=ITLandschaft)


class Anteilseigner(BaseModel):
    """Shareholder information."""
    name: str
    anteil: Optional[str] = None


class Verwaltungsrat(BaseModel):
    """Board member."""
    name: str
    rolle: str


class Geschaeftsfuehrung(BaseModel):
    """Management information."""
    name: str
    rolle: str


class Gesellschaftsstruktur(BaseModel):
    """Corporate structure."""
    ultimate_parent: Optional[str] = None
    anteilseigner: List[Anteilseigner] = Field(default_factory=list)
    verwaltungsrat: List[Verwaltungsrat] = Field(default_factory=list)
    geschaeftsfuehrung: List[Geschaeftsfuehrung] = Field(default_factory=list)


class ZertifizierungCompliance(BaseModel):
    """Certification and compliance."""
    standard: str
    issuer: str
    id_or_cert_no: Optional[str] = None
    valid_through: Optional[str] = None


class IP(BaseModel):
    """Intellectual property."""
    marken: List[str] = Field(default_factory=list)
    patente_kurz: Optional[str] = None


class FinanzHistorie(BaseModel):
    """Financial history entry."""
    jahr: int
    umsatz: Optional[float] = None
    ebitda: Optional[float] = None
    waehrung: str = "CHF"
    source_id: str


class WCKPI(BaseModel):
    """Working capital KPIs."""
    dsos: Optional[int] = None  # Days Sales Outstanding
    dpos: Optional[int] = None  # Days Payable Outstanding
    dios: Optional[int] = None  # Days Inventory Outstanding


class Finanzen(BaseModel):
    """Financial information."""
    mitarbeitende_aktuell: Optional[int] = None
    historie: List[FinanzHistorie] = Field(default_factory=list)
    wc_kpi: WCKPI = Field(default_factory=WCKPI)
    notizen: str = ""


class NewsTimeline(BaseModel):
    """News timeline entry."""
    datum: str
    titel: str
    zusammenfassung: str
    source_id: str


class DealKontext(BaseModel):
    """Deal context."""
    verkaufsgrund: Optional[str] = None
    transition_bedarf: Optional[str] = None
    carve_out: Optional[str] = None


class Diskrepanz(BaseModel):
    """Data discrepancy."""
    feld: str
    wert_a: str
    quelle_a: str
    wert_b: str
    quelle_b: str
    rationale: str
    confidence: float


class Quelle(BaseModel):
    """Source information."""
    id: str
    typ: str  # web|attachment|register
    titel: str
    url_or_file: str
    accessed_utc: str


class Metadata(BaseModel):
    """Metadata."""
    company_query: str
    resolved_legal_name: str
    official_domain: Optional[str] = None
    country: str = "Switzerland"
    base_currency: str = "CHF"
    output_language: str = "de-CH"
    last_updated_utc: str


class SwissCompanyData(BaseModel):
    """Complete Swiss company intelligence data."""
    metadata: Metadata
    identitaet: Identitaet
    klassifikation: Klassifikation
    produkte_dienstleistungen: List[ProduktDienstleistung] = Field(default_factory=list)
    marktanalyse: Marktanalyse = Field(default_factory=Marktanalyse)
    organisation: Organisation = Field(default_factory=Organisation)
    gesellschaftsstruktur: Gesellschaftsstruktur = Field(default_factory=Gesellschaftsstruktur)
    zertifizierungen_compliance: List[ZertifizierungCompliance] = Field(default_factory=list)
    ip: IP = Field(default_factory=IP)
    finanzen: Finanzen = Field(default_factory=Finanzen)
    news_timeline: List[NewsTimeline] = Field(default_factory=list)
    deal_kontext: DealKontext = Field(default_factory=DealKontext)
    risiken: List[str] = Field(default_factory=list)
    usps: List[str] = Field(default_factory=list)
    diskrepanzen: List[Diskrepanz] = Field(default_factory=list)
    quellen: List[Quelle] = Field(default_factory=list)
    confidence_overall: float = 0.0


class CompanyIntelligenceData(BaseModel):
    """Wrapper for company intelligence data."""
    json_data: SwissCompanyData
    markdown_brief: str
