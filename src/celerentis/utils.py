from __future__ import annotations

from collections.abc import Iterable

from pptx.shapes.base import BaseShape

GROUP = 6  # python-pptx shape type for groups


def _iter_shape(shape: BaseShape):
    if getattr(shape, "shape_type", None) == GROUP and hasattr(shape, "shapes"):
        for s in shape.shapes:
            yield from _iter_shape(s)
    else:
        yield shape


def iter_all_shapes(shapes: Iterable[BaseShape]):
    """Yield all shapes, recursively flattening grouped shapes."""
    for shape in shapes:
        yield from _iter_shape(shape)
