import React, { useState, useEffect, useMemo } from "react";
import sampleData from "./samples.json";

// Configuration
const BASE_URL = "http://localhost:8000/api/v1";
const API_VERSION = "v1";
const LOCALSTORAGE_KEY = "samples";
const SAMPLE_TYPES = ["stool", "saliva"];
const KITS = ["16S-v4", "shotgun"];

function formatDate(dateStr: string): string {
  return dateStr.replace("T", " ").replace("Z", " UTC");
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "#d4edda";
    case "failed":
      return "#f8d7da";
    case "in_progress":
      return "#fff3cd";
    default:
      return "#e9ecef";
  }
}

function App() {
  const [samples, setSamples] = useState<any>((sampleData as any)["samples"]);
  const [tab, setTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<any>(null);

  // Submit form state
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newSampleType, setNewSampleType] = useState("stool");
  const [newKit, setNewKit] = useState("16S-v4");

  // Load samples from localStorage on mount, so submitted samples persist
  useEffect(() => {
    console.log("Loading samples...");
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (stored) {
      setSamples(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Keep localStorage in sync with samples
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(samples));
  }, [samples]);

  function handleSubmit() {
    try {
      console.log("Submitting sample...", newSubjectId, newBarcode);
      const newSample: any = {};
      newSample["id"] = "smpl_" + Math.random().toString(36).substring(2, 10);
      newSample["subject_id"] = newSubjectId;
      newSample["barcode"] = newBarcode;
      newSample["sample_type"] = newSampleType;
      newSample["kit"] = newKit;
      newSample["status"] = "received";
      newSample["submitted_at"] = new Date().toISOString();
      newSample["pipeline_runs"] = [];

      // Deep clone to be safe
      const cleanSamples = JSON.parse(JSON.stringify(samples));
      cleanSamples.push(newSample);
      setSamples(cleanSamples);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cleanSamples));
      setLastAction("submitted " + newSample["id"]);

      setNewSubjectId("");
      setNewBarcode("");
      alert("Sample submitted! ID: " + newSample["id"]);
    } catch (e) {
      console.log(e);
    }
  }

  function handleDelete(sampleId: string) {
    console.log("Deleting sample", sampleId);
    const filtered = samples.filter((s: any) => s["id"] !== sampleId);
    setSamples(filtered);
  }

  function handleRefresh() {
    setSamples([...samples]);
  }

  // Compute filtered samples for the list view
  let filtered: any[] = [];
  if (searchQuery !== "") {
    for (const s of samples) {
      if (s["subject_id"].toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered.push(s);
      } else if (s["barcode"].toLowerCase().includes(searchQuery.toLowerCase())) {
        if (filtered.indexOf(s) === -1) {
          filtered.push(s);
        }
      }
    }
  } else {
    filtered = samples;
  }

  // Compute summary by status
  const statuses: string[] = [];
  for (const s of samples) {
    if (statuses.indexOf(s["status"]) === -1) {
      statuses.push(s["status"]);
    }
  }
  const summary: any[] = [];
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
    summary.push({ status: st, count: count, total_reads: totalReads });
  }

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "8px" }}>Sample Tracker</h1>
      <div style={{ color: "#666", marginBottom: "24px" }}>
        {samples.length} samples loaded
      </div>

      <div style={{ marginBottom: "24px", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setTab("list")}
          style={{
            padding: "10px 20px",
            marginRight: "4px",
            border: "none",
            borderBottom: tab === "list" ? "2px solid #333" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: tab === "list" ? "bold" : "normal",
          }}
        >
          List
        </button>
        <button
          onClick={() => setTab("summary")}
          style={{
            padding: "10px 20px",
            marginRight: "4px",
            border: "none",
            borderBottom: tab === "summary" ? "2px solid #333" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: tab === "summary" ? "bold" : "normal",
          }}
        >
          Summary
        </button>
        <button
          onClick={() => setTab("submit")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: tab === "submit" ? "2px solid #333" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: tab === "submit" ? "bold" : "normal",
          }}
        >
          Submit
        </button>
      </div>

      {tab === "list" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search by subject ID or barcode..."
              value={searchQuery}
              onChange={(e) => {
                console.log("search:", e.target.value);
                setSearchQuery(e.target.value);
              }}
              style={{ padding: "8px 12px", width: "320px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <button
              onClick={() => handleRefresh()}
              style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff", cursor: "pointer" }}
            >
              Refresh
            </button>
          </div>
          <div style={{ color: "#666", marginBottom: "12px" }}>
            Showing {filtered.length} sample(s)
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f8f8" }}>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>ID</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Subject</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Barcode</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any, i: number) => (
                <React.Fragment key={i}>
                  <tr
                    onClick={() => setSelectedSampleId(selectedSampleId === s["id"] ? null : s["id"])}
                    style={{ cursor: "pointer", backgroundColor: selectedSampleId === s["id"] ? "#f0f4f8" : "transparent" }}
                  >
                    <td style={{ borderBottom: "1px solid #eee", padding: "10px", fontFamily: "monospace", fontSize: "13px" }}>{s["id"]}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>{s["subject_id"]}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>{s["barcode"]}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "3px", fontSize: "12px", backgroundColor: getStatusColor(s["status"]) }}>
                        {s["status"]}
                      </span>
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "10px", color: "#666", fontSize: "13px" }}>{s["submitted_at"]}</td>
                  </tr>
                  {selectedSampleId === s["id"] && (
                    <tr>
                      <td colSpan={5} style={{ padding: "16px 12px", backgroundColor: "#fafafa", borderBottom: "1px solid #eee" }}>
                        <div style={{ marginBottom: "8px" }}>
                          <strong>Type:</strong> {s["sample_type"]} &nbsp;|&nbsp; <strong>Kit:</strong> {s["kit"]}
                        </div>
                        <div style={{ marginBottom: "4px" }}>
                          <strong>Submitted:</strong> {formatDate(s["submitted_at"])}
                        </div>
                        {s["completed_at"] && (
                          <div style={{ marginBottom: "4px" }}>
                            <strong>Completed:</strong> {formatDate(s["completed_at"])}
                          </div>
                        )}
                        {s["total_reads"] && <div style={{ marginBottom: "8px" }}><strong>Total Reads:</strong> {s["total_reads"]}</div>}
                        <div style={{ marginBottom: "12px" }}>
                          <strong>Pipeline Runs ({(s["pipeline_runs"] || []).length}):</strong>
                          {(s["pipeline_runs"] || []).length === 0 && <span style={{ color: "#999", marginLeft: "8px" }}>none</span>}
                          {(s["pipeline_runs"] || []).map((run: any, j: number) => (
                            <div key={j} style={{ marginLeft: "16px", marginTop: "4px", fontFamily: "monospace", fontSize: "13px" }}>
                              • {run["id"]} ({run["status"]}) {run["pipeline_name"] || ""}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleDelete(s["id"])}
                          style={{ padding: "6px 14px", backgroundColor: "#c82333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                        >
                          Delete Sample
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "summary" && (
        <div>
          <h2>Samples by Status</h2>
          <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f8f8" }}>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "right" }}>Count</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "10px", textAlign: "right" }}>Total Reads</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row: any, i: number) => (
                <tr key={i}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "3px", fontSize: "12px", backgroundColor: row["status"] === "completed" ? "#d4edda" : row["status"] === "failed" ? "#f8d7da" : row["status"] === "in_progress" ? "#fff3cd" : "#e9ecef" }}>
                      {row["status"]}
                    </span>
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px", textAlign: "right" }}>{row["count"]}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px", textAlign: "right", fontFamily: "monospace" }}>{row["total_reads"].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "submit" && (
        <div style={{ maxWidth: "400px" }}>
          <h2>Submit New Sample</h2>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Subject ID</label>
            <input
              type="text"
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              style={{ padding: "8px 12px", width: "100%", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Barcode</label>
            <input
              type="text"
              value={newBarcode}
              onChange={(e) => setNewBarcode(e.target.value)}
              style={{ padding: "8px 12px", width: "100%", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Sample Type</label>
            <select
              value={newSampleType}
              onChange={(e) => setNewSampleType(e.target.value)}
              style={{ padding: "8px 12px", width: "100%", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
            >
              {SAMPLE_TYPES.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Kit</label>
            <select
              value={newKit}
              onChange={(e) => setNewKit(e.target.value)}
              style={{ padding: "8px 12px", width: "100%", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
            >
              {KITS.map((k, i) => (
                <option key={i} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleSubmit()}
            style={{ padding: "10px 24px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Submit Sample
          </button>
          {lastAction && (
            <div style={{ marginTop: "16px", color: "#666", fontSize: "13px" }}>
              Last action: {lastAction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
