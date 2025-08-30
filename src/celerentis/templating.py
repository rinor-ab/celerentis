from __future__ import annotations

from dataclasses import dataclass

from pptx import Presentation
from pptx.text.text import _TextFrame

from .utils import iter_all_shapes

TokenValue = str | list[str]

DEFAULT_TOKENS: dict[str, str] = {
    "{{COMPANY_NAME}}": "company_name",
    "{{TAGLINE}}": "tagline",
    "{{ABOUT_BULLETS}}": "about_bullets",
}


@dataclass(frozen=True)
class TokenStats:
    replaced: int
    missing: list[str]


def _set_bullets(tf: _TextFrame, bullets: list[str]) -> None:
    tf.clear()
    for i, b in enumerate(bullets):
        p = tf.add_paragraph() if i else tf.paragraphs[0]
        p.text = str(b)
        p.level = 0


def replace_tokens(prs: Presentation, data: dict[str, TokenValue]) -> TokenStats:
    """
    Replace occurrences of known tokens in all text frames.
    - Strings are used directly.
    - Lists are rendered as bullets.
    """
    replaced = 0
    seen: set[str] = set()

    for slide in prs.slides:
        for shape in iter_all_shapes(slide.shapes):
            if not getattr(shape, "has_text_frame", False):
                continue
            tf = shape.text_frame
            if tf is None or tf.text is None:
                continue
            text = tf.text
            if "{{ABOUT_BULLETS}}" in text:
                _set_bullets(tf, [str(x) for x in data.get("about_bullets", [])])
                replaced += 1
                seen.add("{{ABOUT_BULLETS}}")
                continue
            for token, key in DEFAULT_TOKENS.items():
                if token in text and key != "about_bullets":
                    tf.text = text.replace(token, str(data.get(key, "")))
                    replaced += 1
                    seen.add(token)

    missing = [t for t in DEFAULT_TOKENS if t not in seen]
    return TokenStats(replaced=replaced, missing=missing)
