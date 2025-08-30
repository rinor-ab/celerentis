from __future__ import annotations

import os
from collections.abc import Iterable
from pathlib import Path

# Headless backend before importing pyplot
os.environ["MPLBACKEND"] = "Agg"

import matplotlib.pyplot as plt


def render_bar(
    financials: Iterable[tuple[int, float]],
    out_path: Path,
    title: str,
    xlabel: str,
    ylabel: str,
) -> Path:
    pairs = [(int(y), float(v)) for y, v in financials]
    years, vals = zip(*pairs, strict=True)
    plt.figure()
    plt.bar(years, vals)
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.tight_layout()
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path)
    plt.close()
    return out_path
