.PHONY: install dev precommit lint fmt type test ci example

install:
	pip install -e .

dev:
	pip install -e ".[dev]"

precommit:
	pre-commit install

lint:
	ruff check .
fmt:
	black .
	ruff check . --fix

type:
	mypy

test:
	pytest

ci: lint type test

example:
	python examples/make_minimal_template.py
	celerentis generate examples/config.sample.yaml

