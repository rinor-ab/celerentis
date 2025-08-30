from pathlib import Path
from celerentis.config import load_config, AppConfig

def test_load_config_ok(tmp_path: Path):
    p = tmp_path / "cfg.yaml"
    p.write_text(
        """
company_name: ACME
tagline: Fast
about_bullets: [one, two]
logo_path: logo.png
financials: [[2020, 10], [2021, 12]]
template_path: template.pptx
output_path: out.pptx
        """,
        encoding="utf-8",
    )
    # create dummy files
    (tmp_path / "logo.png").write_bytes(b"\x89PNG\r\n\x1a\n")
    (tmp_path / "template.pptx").write_bytes(b"fake")  # not validated here
    cfg = load_config(p)
    assert isinstance(cfg, AppConfig)
    assert cfg.company_name == "ACME"
    assert cfg.logo_path.exists()

