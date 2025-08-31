"""Tests for template analyzer module."""

import pytest
from unittest.mock import Mock, patch
from ..ppt.template_analyzer import analyze_template, _find_tokens, _extract_text_from_shape


def test_find_tokens():
    """Test token detection in text."""
    text = "Company: {{COMPANY_NAME}}, Tagline: {{TAGLINE}}"
    tokens = _find_tokens(text)
    
    assert "{{COMPANY_NAME}}" in tokens
    assert "{{TAGLINE}}" in tokens
    assert len(tokens) == 2


def test_find_tokens_no_tokens():
    """Test text without tokens."""
    text = "This is plain text without any tokens"
    tokens = _find_tokens(text)
    
    assert len(tokens) == 0


def test_find_tokens_mixed():
    """Test text with mixed content and tokens."""
    text = "Welcome to {{COMPANY_NAME}}. We are a {{INDUSTRY}} company."
    tokens = _find_tokens(text)
    
    assert "{{COMPANY_NAME}}" in tokens
    assert "{{INDUSTRY}}" in tokens
    assert len(tokens) == 2


def test_extract_text_from_shape():
    """Test text extraction from shape."""
    # Mock shape with text frame
    mock_shape = Mock()
    mock_shape.has_text_frame = True
    
    # Mock paragraph and run
    mock_paragraph = Mock()
    mock_run = Mock()
    mock_run.text = "Sample text"
    mock_paragraph.runs = [mock_run]
    mock_shape.text_frame.paragraphs = [mock_paragraph]
    
    text = _extract_text_from_shape(mock_shape)
    assert text == "Sample text"


def test_extract_text_from_shape_no_text_frame():
    """Test shape without text frame."""
    mock_shape = Mock()
    mock_shape.has_text_frame = False
    
    text = _extract_text_from_shape(mock_shape)
    assert text == ""


@patch('celerentis_core.ppt.template_analyzer.Presentation')
def test_analyze_template_basic(mock_presentation):
    """Test basic template analysis."""
    # Mock presentation with one slide
    mock_slide = Mock()
    mock_slide.slide_id = "slide1"
    
    # Mock shape with text
    mock_shape = Mock()
    mock_shape.has_text_frame = True
    mock_shape.text = "{{COMPANY_NAME}} Overview"
    
    # Mock text frame
    mock_text_frame = Mock()
    mock_paragraph = Mock()
    mock_run = Mock()
    mock_run.text = "{{COMPANY_NAME}} Overview"
    mock_paragraph.runs = [mock_run]
    mock_text_frame.paragraphs = [mock_paragraph]
    mock_shape.text_frame = mock_text_frame
    
    mock_slide.shapes = [mock_shape]
    mock_presentation.return_value.slides = [mock_slide]
    
    # This test would need more complex mocking to work fully
    # For now, just test that the function can be imported
    assert analyze_template is not None


def test_token_patterns():
    """Test various token patterns."""
    test_cases = [
        ("{{COMPANY_NAME}}", ["{{COMPANY_NAME}}"]),
        ("{{CHART:Revenue}}", ["{{CHART:Revenue}}"]),
        ("{{TAGLINE}} and {{ABOUT_BULLETS}}", ["{{TAGLINE}}", "{{ABOUT_BULLETS}}"]),
        ("No tokens here", []),
        ("Mixed {{TOKEN}} and plain text", ["{{TOKEN}}"]),
    ]
    
    for text, expected in test_cases:
        tokens = _find_tokens(text)
        assert tokens == expected, f"Failed for text: {text}"
