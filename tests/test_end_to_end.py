from pathlib import Path
import matplotlib
matplotlib.use("Agg")
from celerentis.config import load_config
from celerentis.generator import generate
from examples.make_minimal_template import prs as _  # ensure module can run

def test_end_to_end(tmp_path: Path, monkeypatch):
    # Make a local copy of example template + logo by re-running script
    from examples import make_minimal_template as m
    m  # noqa: F401
    # Build a sample config in tmp
    cfg_path = tmp_path / "cfg.yaml"
    cfg_path.write_text(
        f"""
company_name: "Acme Test"
tagline: "Fast decks"
about_bullets: ["A","B"]
logo_path: "{(Path("examples") / "logo.png").as_posix()}"
financials: [[2019, 1],[2020, 2]]
template_path: "{(Path("examples") / "template.pptx").as_posix()}"
output_path: "{(tmp_path / "Out.pptx").as_posix()}"
chart:
  title: "Rev"
  xlabel: "Y"
  ylabel: "V"
  placeholder_token: "{{CHART_PLACEHOLDER}}"
""",
        encoding="utf-8",
    )
    cfg = load_config(cfg_path)
    out = generate(cfg)
    assert out.exists()

