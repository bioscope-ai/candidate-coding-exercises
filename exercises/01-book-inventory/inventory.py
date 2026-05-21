#!/usr/bin/env python3
"""
Book Inventory Management System

A command-line interface for managing a personal book inventory. Supports
listing, searching, summarizing by genre, computing total inventory value,
and adding new books to the collection.
"""

import sys
import os


# Configuration
BOOKS_FILE = "books.csv"


def load_books(filename=BOOKS_FILE):
    """
    Load books from a CSV file.

    This function reads the CSV file and returns a list of books.
    Each book is represented as a dictionary with the appropriate fields.
    """
    books = []
    try:
        f = open(filename, "r")
        lines = f.readlines()
        f.close()

        # Skip the header row
        for i in range(1, len(lines)):
            line = lines[i].strip()
            if line == "":
                continue
            parts = line.split(",")
            book = {}
            book["title"] = parts[0]
            book["author"] = parts[1]
            book["genre"] = parts[2]
            book["year"] = parts[3]
            book["price"] = parts[4]
            book["copies"] = parts[5]
            books.append(book)

        print("Successfully loaded " + str(len(books)) + " books from " + filename)
        return books
    except Exception as e:
        print("Error: Could not load books file")
        print(e)
        return []


def list_books(books):
    """List all books in the inventory."""
    print("")
    print("=" * 60)
    print("BOOK INVENTORY")
    print("=" * 60)
    for i in range(0, len(books)):
        book = books[i]
        output = ""
        output = output + book["title"]
        output = output + " by "
        output = output + book["author"]
        output = output + " (" + book["year"] + ")"
        print(output)
    print("=" * 60)
    print("Total: " + str(len(books)) + " books")


def search_books(books, query):
    """Search for books matching the query in title or author."""
    results = []
    for b in books:
        if query.lower() in b["title"].lower():
            results.append(b)
        elif query.lower() in b["author"].lower():
            if b not in results:
                results.append(b)

    if len(results) == 0:
        print("No books found matching '" + query + "'")
        return

    print("Found " + str(len(results)) + " book(s):")
    for r in results:
        print("  - " + r["title"] + " by " + r["author"])


def summary_by_genre(books):
    """Show a summary of books grouped by genre."""
    genres = []
    for b in books:
        if b["genre"] not in genres:
            genres.append(b["genre"])

    print("")
    print("BOOKS BY GENRE")
    print("-" * 40)
    for g in genres:
        count = 0
        total_value = 0.0
        for b in books:
            if b["genre"] == g:
                count = count + 1
                total_value = total_value + (float(b["price"]) * int(b["copies"]))
        print(g + ": " + str(count) + " titles, $" + str(round(total_value, 2)) + " inventory value")


def total_inventory_value(books, results=[]):
    """Calculate the total inventory value across all books."""
    total = 0.0
    for b in books:
        price = float(b["price"])
        copies = int(b["copies"])
        value = price * copies
        total = total + value
        results.append(value)
    return total


def add_book(books, title, author, genre, year, price, copies):
    """Add a new book to the inventory and persist to disk."""
    new_book = {}
    new_book["title"] = title
    new_book["author"] = author
    new_book["genre"] = genre
    new_book["year"] = year
    new_book["price"] = price
    new_book["copies"] = copies
    books.append(new_book)

    # Now write the entire inventory back to the file
    f = open(BOOKS_FILE, "w")
    f.write("title,author,genre,year,price,copies\n")
    for b in books:
        line = b["title"] + "," + b["author"] + "," + b["genre"] + "," + b["year"] + "," + b["price"] + "," + b["copies"] + "\n"
        f.write(line)
    f.close()
    print("Book added successfully!")


def main():
    """Main entry point for the application."""
    if len(sys.argv) < 2:
        print("Usage: python inventory.py <command> [args]")
        print("Commands: list, search, summary, value, add")
        sys.exit(1)

    command = sys.argv[1]
    books = load_books()

    if command == "list":
        list_books(books)
    elif command == "search":
        if len(sys.argv) < 3:
            print("Usage: python inventory.py search <query>")
            sys.exit(1)
        query = sys.argv[2]
        search_books(books, query)
    elif command == "summary":
        summary_by_genre(books)
    elif command == "value":
        total = total_inventory_value(books)
        print("Total inventory value: $" + str(round(total, 2)))
    elif command == "add":
        if len(sys.argv) < 8:
            print("Usage: python inventory.py add <title> <author> <genre> <year> <price> <copies>")
            sys.exit(1)
        add_book(books, sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7])
    else:
        print("Unknown command: " + command)
        sys.exit(1)


if __name__ == "__main__":
    main()
