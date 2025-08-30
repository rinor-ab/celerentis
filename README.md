# Celerentis

**Celerentis** generates polished PowerPoint decks from a template and structured inputs.
It’s built for M&A/PE/VC/AM boutiques that want speed **and** precision.

## Features
- Template-driven token replacement (titles, text, bullet lists)
- Logo placement on the title slide
- Chart rendering from numeric data
- CLI: `celerentis generate …`, `inspect`, `validate`
- Tests, type-checking, linting, CI, pre-commit

## Quickstart

```bash
# 1) create & activate env (conda or venv); then:
pip install -e ".[dev]"
pre-commit install

# 2) make an example template and run the sample config
make example
# -> outputs examples/OutDeck.pptx
