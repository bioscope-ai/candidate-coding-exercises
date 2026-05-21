import React, { useState, useEffect } from "react";
import sampleData from "./samples.json";

function App() {
  const [samples, setSamples] = useState<any>(sampleData["samples"]);
  const [tab, setTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<any>(null);

  // Submit form state
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newSampleType, setNewSampleType] = useState("stool");
  const [newKit, setNewKit] = useState("16S-v4");

  // Load samples from localStorage on mount, so submitted samples persist
  useEffect(() => {
    const stored = localStorage.getItem("samples");
    if (stored) {
      setSamples(JSON.parse(stored));
    }
  }, []);

  function handleSubmit() {
    const newSample: any = {};
    newSample["id"] = "smpl_" + Math.random().toString(36).substring(2, 10);
    newSample["subject_id"] = newSubjectId;
    newSample["barcode"] = newBarcode;
    newSample["sample_type"] = newSampleType;
    newSample["kit"] = newKit;
    newSample["status"] = "received";
    newSample["submitted_at"] = new Date().toISOString();
    newSample["pipeline_runs"] = [];

    samples.push(newSample);
    setSamples(samples);
    localStorage.setItem("samples", JSON.stringify(samples));

    setNewSubjectId("");
    setNewBarcode("");
    alert("Sample submitted! ID: " + newSample["id"]);
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
          <input
            type="text"
            placeholder="Search by subject ID or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "8px 12px", width: "320px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
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
                      <span style={{ padding: "2px 8px", borderRadius: "3px", fontSize: "12px", backgroundColor: s["status"] === "completed" ? "#d4edda" : s["status"] === "failed" ? "#f8d7da" : s["status"] === "in_progress" ? "#fff3cd" : "#e9ecef" }}>
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
                        {s["completed_at"] && <div style={{ marginBottom: "4px" }}><strong>Completed:</strong> {s["completed_at"]}</div>}
                        {s["total_reads"] && <div style={{ marginBottom: "8px" }}><strong>Total Reads:</strong> {s["total_reads"]}</div>}
                        <div>
                          <strong>Pipeline Runs ({(s["pipeline_runs"] || []).length}):</strong>
                          {(s["pipeline_runs"] || []).length === 0 && <span style={{ color: "#999", marginLeft: "8px" }}>none</span>}
                          {(s["pipeline_runs"] || []).map((run: any, j: number) => (
                            <div key={j} style={{ marginLeft: "16px", marginTop: "4px", fontFamily: "monospace", fontSize: "13px" }}>
                              • {run["id"]} ({run["status"]}) {run["pipeline_name"] || ""}
                            </div>
                          ))}
                        </div>
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
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px" }}>{row["status"]}</td>
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
              <option value="stool">stool</option>
              <option value="saliva">saliva</option>
            </select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Kit</label>
            <select
              value={newKit}
              onChange={(e) => setNewKit(e.target.value)}
              style={{ padding: "8px 12px", width: "100%", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
            >
              <option value="16S-v4">16S-v4</option>
              <option value="shotgun">shotgun</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            style={{ padding: "10px 24px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Submit Sample
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
