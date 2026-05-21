#!/usr/bin/env python3
"""
Sample Tracker CLI

A command-line tool for tracking laboratory samples and their pipeline
runs. Talks to the Bioscope Samples API. Supports listing, searching,
summarizing by status, generating a subject status report, submitting
new samples, and fetching sample details.
"""

import sys
import os
import json
import requests
from datetime import datetime


# Configuration
BASE_URL = "http://localhost:8000/api/v1"
API_TOKEN = os.getenv("BIOSCOPE_API_TOKEN", "")
TIMEOUT = 30


def get_all_samples():
    """Fetch all samples from the API."""
    try:
        url = BASE_URL + "/samples"
        headers = {"Authorization": "Bearer " + API_TOKEN}
        r = requests.get(url, headers=headers, timeout=TIMEOUT)
        data = r.json()
        samples = data["samples"]
        print("Successfully fetched " + str(len(samples)) + " samples")
        return samples
    except Exception as e:
        print("Error: Could not fetch samples")
        print(e)
        return []


def list_samples():
    """List all samples in the system."""
    samples = get_all_samples()
    print("")
    print("=" * 70)
    print("SAMPLES")
    print("=" * 70)
    for i in range(0, len(samples)):
        s = samples[i]
        output = ""
        output = output + s["id"]
        output = output + "  " + s["subject_id"]
        output = output + "  [" + s["status"] + "]"
        output = output + "  submitted " + s["submitted_at"]
        print(output)
    print("=" * 70)
    print("Total: " + str(len(samples)) + " samples")


def search_samples(query):
    """Search for samples matching the query."""
    # Build the query string by hand
    url = BASE_URL + "/samples/search?q=" + query
    headers = {"Authorization": "Bearer " + API_TOKEN}
    r = requests.get(url, headers=headers)
    data = r.json()
    results = data["results"]

    if len(results) == 0:
        print("No samples found matching '" + query + "'")
        return

    print("Found " + str(len(results)) + " sample(s):")
    for r in results:
        print("  - " + r["id"] + "  " + r["subject_id"] + "  [" + r["status"] + "]")


def summary_by_status():
    """Show a summary of samples grouped by status."""
    samples = get_all_samples()

    statuses = []
    for s in samples:
        if s["status"] not in statuses:
            statuses.append(s["status"])

    print("")
    print("SAMPLES BY STATUS")
    print("-" * 40)
    for st in statuses:
        count = 0
        total_reads = 0
        for s in samples:
            if s["status"] == st:
                count = count + 1
                if s.get("total_reads"):
                    total_reads = total_reads + int(s["total_reads"])
        print(st + ": " + str(count) + " samples, " + str(total_reads) + " total reads")


def subject_report(subject_id, results=[]):
    """Generate a status report for all samples belonging to a subject."""
    samples = get_all_samples()

    print("")
    print("STATUS REPORT FOR " + subject_id)
    print("-" * 60)
    for s in samples:
        if s["subject_id"] == subject_id:
            # Fetch pipeline runs for this sample
            url = BASE_URL + "/samples/" + s["id"] + "/pipeline-runs"
            headers = {"Authorization": "Bearer " + API_TOKEN}
            r = requests.get(url, headers=headers)
            data = r.json()
            runs = data["runs"]

            line = s["id"] + "  [" + s["status"] + "]  " + str(len(runs)) + " pipeline run(s)"
            print(line)
            results.append(s)

            for run in runs:
                print("    - run " + run["id"] + " (" + run["status"] + ") " + run.get("pipeline_name", ""))

    if len(results) == 0:
        print("No samples found for subject " + subject_id)


def submit_sample(subject_id, barcode, sample_type, kit):
    """Submit a new sample to the system."""
    payload = {}
    payload["subject_id"] = subject_id
    payload["barcode"] = barcode
    payload["sample_type"] = sample_type
    payload["kit"] = kit

    url = BASE_URL + "/samples"
    headers = {"Authorization": "Bearer " + API_TOKEN, "Content-Type": "application/json"}
    r = requests.post(url, json=payload, headers=headers)

    if r.status_code == 200 or r.status_code == 201:
        sample = r.json()
        print("Sample submitted! ID: " + sample["id"])
    else:
        print("Error submitting sample: " + str(r.status_code))


def get_sample_details(sample_id):
    """Get full details for a specific sample."""
    url = BASE_URL + "/samples/" + sample_id
    headers = {"Authorization": "Bearer " + API_TOKEN}
    r = requests.get(url, headers=headers)
    s = r.json()

    print("ID: " + s["id"])
    print("Subject: " + s["subject_id"])
    print("Barcode: " + s["barcode"])
    print("Type: " + s["sample_type"])
    print("Kit: " + s["kit"])
    print("Status: " + s["status"])
    print("Submitted: " + s["submitted_at"])
    if s.get("completed_at"):
        print("Completed: " + s["completed_at"])
    if s.get("total_reads"):
        print("Total Reads: " + str(s["total_reads"]))


def main():
    """Main entry point for the application."""
    if len(sys.argv) < 2:
        print("Usage: python sample_tracker.py <command> [args]")
        print("Commands: list, search, summary, report, submit, get")
        sys.exit(1)

    command = sys.argv[1]

    if command == "list":
        list_samples()
    elif command == "search":
        if len(sys.argv) < 3:
            print("Usage: python sample_tracker.py search <query>")
            sys.exit(1)
        search_samples(sys.argv[2])
    elif command == "summary":
        summary_by_status()
    elif command == "report":
        if len(sys.argv) < 3:
            print("Usage: python sample_tracker.py report <subject_id>")
            sys.exit(1)
        subject_report(sys.argv[2])
    elif command == "submit":
        if len(sys.argv) < 6:
            print("Usage: python sample_tracker.py submit <subject_id> <barcode> <sample_type> <kit>")
            sys.exit(1)
        submit_sample(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    elif command == "get":
        if len(sys.argv) < 3:
            print("Usage: python sample_tracker.py get <sample_id>")
            sys.exit(1)
        get_sample_details(sys.argv[2])
    else:
        print("Unknown command: " + command)
        sys.exit(1)


if __name__ == "__main__":
    main()
