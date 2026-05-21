# Exercise 01: Book Inventory CLI

A small command-line book inventory tool, written in Python.

## What you're working with

`inventory.py` is a CLI that can list, search, summarize, and add books in a CSV-backed inventory. The author tested it on their own bookshelf and the listed commands run end-to-end on at least some inputs.

It also has problems. Some are real bugs that haven't bitten anyone yet. Some are choices that will hurt as the code grows. Some are just unpleasant to read.

## Your task

In this session we'd like you to:

1. Read through `inventory.py` and `books.csv`.
2. Walk us through what you see — what's good, what's bad, what's actually broken, what's just stylistic.
3. Pick the issues that matter most and refactor them, talking through your reasoning as you go.

You don't need to fix everything, and there's no hidden "correct" answer. We're more interested in how you prioritize and what trade-offs you make than in seeing a perfect rewrite.

Feel free to ask questions, look things up, and use whatever tools you'd normally reach for.

## Running it

```bash
python3 inventory.py list
python3 inventory.py search tolkien
python3 inventory.py summary
python3 inventory.py value
python3 inventory.py add "New Book" "Author Name" Fiction 2024 19.99 3
```

No third-party dependencies — only the Python standard library. Tested with Python 3.10+.
