from __future__ import annotations

from pathlib import Path
from typing import Iterable, Tuple

import matplotlib
matplotlib.use("Agg")  # headless
import matplotlib.pyplot as plt  # noqa: E402

def render_bar(financials: Iterable[Tuple[int, float]], out_path: Path,
               title: str, xlabel: str, ylabel: str) -> Path:
    years, vals = zip(*[(int(y), float(v)) for y, v in financials])
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

