from __future__ import annotations

import runpy
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

from celerentis.config import load_config
from celerentis.generator import generate


def test_end_to_end(tmp_path: Path) -> None:
    # Generate example template & logo in repo/examples
    runpy.run_path("examples/make_minimal_template.py", run_name="__main__")

    examples_dir = Path("examples").resolve()
    template_abs = (examples_dir / "template.pptx").as_posix()
    logo_abs = (examples_dir / "logo.png").as_posix()

    cfg_path = tmp_path / "cfg.yaml"
    cfg_path.write_text(
        f"""
company_name: "Acme Test"
tagline: "Fast decks"
about_bullets: ["A","B"]
logo_path: "{logo_abs}"
financials: [[2019, 1],[2020, 2]]
template_path: "{template_abs}"
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
