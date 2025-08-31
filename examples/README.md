# Celerentis Examples

This directory contains example files to test the IM generation system.

## Files

### template_bank_style.pptx
A PowerPoint template with the following tokens:
- `{{COMPANY_NAME}}` - Company name placeholder
- `{{TAGLINE}}` - Company tagline placeholder  
- `{{ABOUT_BULLETS}}` - Content bullets placeholder
- `{{CHART:Revenue}}` - Revenue chart placeholder

### financials.xlsx
An Excel file with financial data:
- Sheet: "Financials"
- Columns: Year, Revenue
- Sample data: 2020-2024 revenue figures

### plan.pdf
A sample business plan document with company overview text.

## Usage

1. Upload these files when creating a new IM job
2. The system will:
   - Analyze the template structure
   - Extract financial data from Excel
   - Process the PDF content
   - Generate slide content using AI
   - Create charts from Excel data
   - Build the final PowerPoint

## Testing

Use these files to verify:
- Template analysis works correctly
- Financial data parsing functions
- Document text extraction
- AI content generation
- Chart creation with Excel data
- Final PowerPoint output quality
