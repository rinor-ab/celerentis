from pptx import Presentation
from pptx.util import Inches

from celerentis.templating import replace_tokens


def test_replace_tokens_basic(tmp_path):
    prs = Presentation()
    s = prs.slides.add_slide(prs.slide_layouts[5])
    tb = s.shapes.add_textbox(Inches(1), Inches(1), Inches(5), Inches(1))
    tb.text_frame.text = "{{COMPANY_NAME}} / {{TAGLINE}}"
    prs.save(tmp_path / "t.pptx")

    prs = Presentation(str(tmp_path / "t.pptx"))
    replace_tokens(prs, {"company_name": "ACME", "tagline": "Fast", "about_bullets": []})
    text = prs.slides[0].shapes[1].text_frame.text
    assert "ACME" in text
    assert "Fast" in text
