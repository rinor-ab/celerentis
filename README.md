<<<<<<< HEAD
# Celerentis - AI IM Generator

Celerentis is a production-grade web application that generates professional Information Memorandum (IM) PowerPoint presentations using AI. The system learns structure and style from reference templates and fills them with content from user uploads and public data.

## 🚀 Features

- **AI-Powered Content Generation**: Uses OpenAI to create professional slide content
- **Template Analysis**: Automatically detects tokens and chart placeholders in PowerPoint templates
- **Excel Integration**: Parses financial data and creates Excel-backed charts (editable in PowerPoint)
- **Document Processing**: Extracts text from PDFs, PowerPoints, and Word documents
- **Logo Fetching**: Automatically retrieves company logos from websites
- **Background Processing**: Asynchronous job processing with real-time status updates
- **Modern Web UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## 🏗️ Architecture

```
celerentis/
├── apps/
│   ├── web/           # Next.js frontend (React + TypeScript + Tailwind)
│   ├── api/           # FastAPI backend (Python 3.11)
│   └── worker/        # Celery worker for background jobs
├── packages/
│   └── core/          # Shared Python package
├── infra/             # Docker configuration
└── examples/           # Sample files for testing
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, Pydantic v2
- **Worker**: Celery, Redis
- **Database**: PostgreSQL, SQLAlchemy, Alembic
- **Storage**: S3-compatible (MinIO for local dev)
- **AI**: OpenAI GPT-4
- **Document Processing**: python-pptx, pandas, openpyxl, PyMuPDF
- **Containerization**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Node.js 18+ (for local development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd celerentis
cp infra/env.example infra/.env
```

### 2. Configure Environment

Edit `infra/.env` and set your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Start the Stack

```bash
cd infra
docker-compose up -d
```

This will start:
- **Web UI**: http://localhost:3000
- **API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (admin/minio123)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Test the System

1. Open http://localhost:3000
2. Click "New IM"
3. Upload the example files from `/examples/`
4. Create a job and monitor progress
5. Download the generated PowerPoint

## 📁 Example Files

The `/examples/` directory contains sample files to test the system:

- `template_bank_style.pptx` - PowerPoint template with tokens
- `financials.xlsx` - Sample financial data
- `plan.pdf` - Business plan document

## 🔧 Development

### Local Development Setup

```bash
# Install Python dependencies
cd packages/core
pip install -e .

# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd apps/api
pip install -r requirements.txt

# Start services individually
cd infra
docker-compose up db redis minio
```

### Running Tests

```bash
cd packages/core
pytest tests/
```

### Code Quality

```bash
cd packages/core
ruff check .
mypy .
```

## 📊 How It Works

### 1. Template Analysis
- Upload PowerPoint template with tokens like `{{COMPANY_NAME}}`
- System analyzes structure and identifies placeholders
- Detects chart tokens like `{{CHART:Revenue}}`

### 2. Content Processing
- Extract text from uploaded documents (PDFs, Word, etc.)
- Parse Excel financial data into structured format
- Fetch company logo from website (if enabled)

### 3. AI Content Generation
- Use OpenAI to generate slide content
- Style-matched to template examples
- Grounded in uploaded document content
- Professional banking tone

### 4. PowerPoint Assembly
- Replace text tokens with generated content
- Insert Excel-backed charts (not static images)
- Add company logo
- Preserve template styling and formatting

### 5. Output
- Download-ready PowerPoint (.pptx)
- Charts are Excel-linked (editable via "Edit Data in Excel")
- Professional Information Memorandum format

## 🔑 Key Features

### Excel-Backed Charts
- Charts are created using `ChartData` and `add_chart`
- Data is embedded as Excel workbook
- Users can edit chart data directly in PowerPoint
- No static images - fully interactive

### Token System
- `{{COMPANY_NAME}}` → Company name
- `{{TAGLINE}}` → Generated tagline
- `{{ABOUT_BULLETS}}` → AI-generated bullet points
- `{{CHART:Revenue}}` → Excel chart from financial data

### Background Processing
- Jobs are queued and processed asynchronously
- Real-time status updates via polling
- Progress tracking through Celery task states
- Scalable worker architecture

## 🚨 Important Notes

### Do NOT:
- ❌ Insert charts as images (must be Excel-backed)
- ❌ Depend on Windows COM (Linux container compatible)
- ❌ Hard-code API keys (use environment variables)
- ❌ Block HTTP requests during generation (use background jobs)
- ❌ Hallucinate financial figures (use Excel data or mark uncertain)

### Security & Privacy
- Files stored in EU region bucket
- Encryption at rest and in transit
- Auto-deletion after 14 days
- PII masking in logs

## 🧪 Testing

### Unit Tests
- Template analyzer finds tokens and chart placeholders
- Financials parser returns correct series
- Builder inserts ChartData charts

### Integration Tests
- End-to-end job creation and processing
- File upload, processing, and download
- Chart generation and Excel linking

### Acceptance Criteria
- Jobs complete under 90 seconds on dev hardware
- Error handling with human-readable messages
- PowerPoint opens with editable charts

## 🔮 Future Enhancements

- Single-slide regeneration API
- Slide preview before download
- Table insertion from Excel named ranges
- Office.js add-in for data refresh
- Advanced chart types and customization
- Multi-language support
- Template marketplace

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the documentation
- Review example files
- Open an issue on GitHub

---

**Celerentis** - Professional Information Memoranda, Generated by AI

## 🎯 Purpose

Celerentis generates polished PowerPoint decks from a template and structured inputs.
It's built for M&A/PE/VC/AM boutiques that want speed **and** precision.

### Core Features
- Template-driven token replacement (titles, text, bullet lists)
- Logo placement on the title slide
- Chart rendering from numeric data
- CLI: `celerentis generate …`, `inspect`, `validate`
- Tests, type-checking, linting, CI, pre-commit

## Quickstart

```bash
# 1) create & activate env (conda or venv); then:
pip install -e ".[dev]"
pre-commit install

# 2) make an example template and run the sample config
make example
# -> outputs examples/OutDeck.pptx
