from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# Token value can be a string or a list of strings (for bullets)
TokenValue = str | list[str]

# Map of template tokens to data keys
DEFAULT_TOKENS: dict[str, str] = {
    "{{COMPANY_NAME}}": "company_name",
    "{{TAGLINE}}": "tagline",
    "{{ABOUT_BULLETS}}": "about_bullets",
}


@dataclass(frozen=True)
class TokenStats:
    replaced: int
    missing: list[str]


def _set_bullets(tf: Any, bullets: list[str]) -> None:
    """Render a list of strings as bullet points in a text frame."""
    tf.clear()
    for i, b in enumerate(bullets):
        p = tf.add_paragraph() if i else tf.paragraphs[0]
        p.text = str(b)
        p.level = 0


def replace_tokens(prs: Any, data: dict[str, TokenValue]) -> TokenStats:
    """
    Replace occurrences of known tokens in all text frames.
    - Strings are replaced directly.
    - Lists are rendered as bullets.
    Handles multiple tokens appearing in the same text box.
    """
    replaced = 0
    seen: set[str] = set()

    for slide in prs.slides:
        for shape in slide.shapes:
            # Flatten grouped shapes
            stack = [shape]
            while stack:
                sh = stack.pop()
                if getattr(sh, "shape_type", None) == 6 and hasattr(sh, "shapes"):
                    stack.extend(list(sh.shapes))
                    continue
                if not getattr(sh, "has_text_frame", False):
                    continue

                tf = sh.text_frame
                if tf is None or tf.text is None:
                    continue

                # 1) Special-case bullets
                if "{{ABOUT_BULLETS}}" in (tf.text or ""):
                    _set_bullets(tf, [str(x) for x in data.get("about_bullets", [])])
                    replaced += 1
                    seen.add("{{ABOUT_BULLETS}}")

                # 2) Replace simple tokens iteratively using current text each time
                for token, key in DEFAULT_TOKENS.items():
                    if key == "about_bullets":
                        continue
                    current = tf.text or ""
                    if token in current:
                        tf.text = current.replace(token, str(data.get(key, "")))
                        replaced += 1
                        seen.add(token)

    missing = [t for t in DEFAULT_TOKENS if t not in seen]
    return TokenStats(replaced=replaced, missing=missing)
