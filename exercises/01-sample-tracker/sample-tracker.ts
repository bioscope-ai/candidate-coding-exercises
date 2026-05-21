#!/usr/bin/env node

/**
 * Sample Tracker CLI
 *
 * A command-line tool for tracking laboratory samples and their pipeline
 * runs. Supports listing, searching, summarizing by status, generating
 * a subject status report, submitting new samples, and fetching sample
 * details.
 */

import * as fs from "fs";
import * as path from "path";

// Configuration
const DATA_FILE = "samples.json";

interface PipelineRun {
  id: string;
  status: string;
  pipeline_name?: string;
}

interface Sample {
  id: string;
  subject_id: string;
  barcode: string;
  sample_type: string;
  kit: string;
  status: string;
  submitted_at: string;
  completed_at?: string;
  total_reads?: number;
  pipeline_runs?: PipelineRun[];
}

function loadSamples(): any[] {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    const samples = parsed["samples"];
    console.log("Successfully loaded " + samples.length + " samples");
    return samples;
  } catch (e) {
    console.log("Error: Could not load samples file");
    console.log(e);
    return [];
  }
}

function saveSamples(samples: any[]) {
  const payload = { samples: samples };
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
}

function listSamples() {
  const samples = loadSamples();
  console.log("");
  console.log("=".repeat(70));
  console.log("SAMPLES");
  console.log("=".repeat(70));
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    let output = "";
    output = output + s["id"];
    output = output + "  " + s["subject_id"];
    output = output + "  [" + s["status"] + "]";
    output = output + "  submitted " + s["submitted_at"];
    console.log(output);
  }
  console.log("=".repeat(70));
  console.log("Total: " + samples.length + " samples");
}

function searchSamples(query: string) {
  const samples = loadSamples();
  const results: any[] = [];

  for (const s of samples) {
    if (s["subject_id"].toLowerCase().includes(query.toLowerCase())) {
      results.push(s);
    } else if (s["barcode"].toLowerCase().includes(query.toLowerCase())) {
      if (results.indexOf(s) === -1) {
        results.push(s);
      }
    }
  }

  if (results.length === 0) {
    console.log("No samples found matching '" + query + "'");
    return;
  }

  console.log("Found " + results.length + " sample(s):");
  for (const r of results) {
    console.log("  - " + r["id"] + "  " + r["subject_id"] + "  [" + r["status"] + "]");
  }
}

function summaryByStatus() {
  const samples = loadSamples();

  const statuses: string[] = [];
  for (const s of samples) {
    if (statuses.indexOf(s["status"]) === -1) {
      statuses.push(s["status"]);
    }
  }

  console.log("");
  console.log("SAMPLES BY STATUS");
  console.log("-".repeat(40));
  for (const st of statuses) {
    let count = 0;
    let totalReads = 0;
    for (const s of samples) {
      if (s["status"] === st) {
        count = count + 1;
        if (s["total_reads"]) {
          totalReads = totalReads + parseInt(s["total_reads"]);
        }
      }
    }
    console.log(st + ": " + count + " samples, " + totalReads + " total reads");
  }
}

function subjectReport(subjectId: string, results: any[] = []) {
  const samples = loadSamples();

  console.log("");
  console.log("STATUS REPORT FOR " + subjectId);
  console.log("-".repeat(60));
  for (const s of samples) {
    if (s["subject_id"] === subjectId) {
      const runs = s["pipeline_runs"] || [];

      const line = s["id"] + "  [" + s["status"] + "]  " + runs.length + " pipeline run(s)";
      console.log(line);
      results.push(s);

      for (const run of runs) {
        console.log("    - run " + run["id"] + " (" + run["status"] + ") " + (run["pipeline_name"] || ""));
      }
    }
  }

  if (results.length === 0) {
    console.log("No samples found for subject " + subjectId);
  }
}

function submitSample(subjectId: string, barcode: string, sampleType: string, kit: string) {
  const samples = loadSamples();

  const newSample: any = {};
  newSample["id"] = "smpl_" + Math.random().toString(36).substring(2, 10);
  newSample["subject_id"] = subjectId;
  newSample["barcode"] = barcode;
  newSample["sample_type"] = sampleType;
  newSample["kit"] = kit;
  newSample["status"] = "received";
  newSample["submitted_at"] = new Date().toISOString();
  newSample["pipeline_runs"] = [];

  samples.push(newSample);
  saveSamples(samples);

  console.log("Sample submitted! ID: " + newSample["id"]);
}

function getSampleDetails(sampleId: string) {
  const samples = loadSamples();

  let s: any = null;
  for (const sample of samples) {
    if (sample["id"] === sampleId) {
      s = sample;
      break;
    }
  }

  if (s === null) {
    console.log("Sample not found: " + sampleId);
    return;
  }

  console.log("ID: " + s["id"]);
  console.log("Subject: " + s["subject_id"]);
  console.log("Barcode: " + s["barcode"]);
  console.log("Type: " + s["sample_type"]);
  console.log("Kit: " + s["kit"]);
  console.log("Status: " + s["status"]);
  console.log("Submitted: " + s["submitted_at"]);
  if (s["completed_at"]) {
    console.log("Completed: " + s["completed_at"]);
  }
  if (s["total_reads"]) {
    console.log("Total Reads: " + s["total_reads"]);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: tsx sample-tracker.ts <command> [args]");
    console.log("Commands: list, search, summary, report, submit, get");
    process.exit(1);
  }

  const command = args[0];

  if (command === "list") {
    listSamples();
  } else if (command === "search") {
    if (args.length < 2) {
      console.log("Usage: tsx sample-tracker.ts search <query>");
      process.exit(1);
    }
    searchSamples(args[1]);
  } else if (command === "summary") {
    summaryByStatus();
  } else if (command === "report") {
    if (args.length < 2) {
      console.log("Usage: tsx sample-tracker.ts report <subject_id>");
      process.exit(1);
    }
    subjectReport(args[1]);
  } else if (command === "submit") {
    if (args.length < 5) {
      console.log("Usage: tsx sample-tracker.ts submit <subject_id> <barcode> <sample_type> <kit>");
      process.exit(1);
    }
    submitSample(args[1], args[2], args[3], args[4]);
  } else if (command === "get") {
    if (args.length < 2) {
      console.log("Usage: tsx sample-tracker.ts get <sample_id>");
      process.exit(1);
    }
    getSampleDetails(args[1]);
  } else {
    console.log("Unknown command: " + command);
    process.exit(1);
  }
}

main();
