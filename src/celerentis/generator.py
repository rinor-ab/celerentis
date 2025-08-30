from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.util import Inches

from .charts import render_bar
from .config import AppConfig
from .templating import replace_tokens
from .utils import iter_all_shapes

EMU_PER_INCH = 914400


def _to_inches(emu: int) -> float:
    return emu / EMU_PER_INCH


def _remove_shape(shape) -> None:
    elm = shape._element
    elm.getparent().remove(elm)


def _find_chart_placeholder(
    prs: Presentation, token: str
) -> tuple[int, object] | tuple[None, None]:
    for si, slide in enumerate(prs.slides):
        for shape in iter_all_shapes(slide.shapes):
            if getattr(shape, "has_text_frame", False) and token in shape.text_frame.text:
                return si, shape
    return None, None


def _add_logo_to_title(prs: Presentation, logo_path: Path) -> None:
    if not Path(logo_path).is_file():
        return
    slide = prs.slides[0]
    width = Inches(1.5)
    left = Inches((_to_inches(prs.slide_width)) - 1.8)
    top = Inches(0.3)
    slide.shapes.add_picture(str(logo_path), left, top, width=width)


def generate(config: AppConfig) -> Path:
    prs = Presentation(str(config.template_path))

    replace_tokens(
        prs,
        {
            "company_name": config.company_name,
            "tagline": config.tagline,
            "about_bullets": config.about_bullets,
        },
    )

    _add_logo_to_title(prs, config.logo_path)

    si, ph = _find_chart_placeholder(prs, config.chart.placeholder_token)
    if si is not None and ph is not None:
        chart_path = render_bar(
            config.financials,
            out_path=config.output_path.with_suffix(".chart.png"),
            title=config.chart.title,
            xlabel=config.chart.xlabel,
            ylabel=config.chart.ylabel,
        )
        left = Inches(_to_inches(getattr(ph, "left", 0)))
        top = Inches(_to_inches(getattr(ph, "top", 0)))
        width = Inches(_to_inches(getattr(ph, "width", int(prs.slide_width * 0.6))))
        height = Inches(_to_inches(getattr(ph, "height", int(prs.slide_height * 0.5))))
        _remove_shape(ph)
        prs.slides[si].shapes.add_picture(str(chart_path), left, top, width=width, height=height)

    config.output_path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(config.output_path))
    return config.output_path
