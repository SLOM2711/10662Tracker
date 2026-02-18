import { useState, useCallback } from "react";

const GRADE_THRESHOLDS = [
  { min: 90, grade: "O", point: 10, label: "Outstanding" },
  { min: 80, grade: "A+", point: 9, label: "Excellent" },
  { min: 70, grade: "A", point: 8, label: "Very Good" },
  { min: 60, grade: "B+", point: 7, label: "Good" },
  { min: 50, grade: "B", point: 6, label: "Average" },
  { min: 40, grade: "C", point: 5, label: "Satisfactory" },
  { min: 0, grade: "F", point: 0, label: "Fail" },
];

function getGradeInfo(marks) {
  if (marks === "" || isNaN(marks)) return null;
  const m = Number(marks);
  return GRADE_THRESHOLDS.find((t) => m >= t.min);
}

function getCGPALabel(cgpa) {
  if (cgpa >= 9) return "Outstanding";
  if (cgpa >= 8) return "Excellent";
  if (cgpa >= 7) return "Very Good";
  if (cgpa >= 6) return "Good";
  if (cgpa >= 5) return "Average";
  return "Needs Improvement";
}

const defaultSubjects = [
  { id: 1, name: "Mathematics", marks: "", credits: 4 },
  { id: 2, name: "Physics", marks: "", credits: 3 },
  { id: 3, name: "Chemistry", marks: "", credits: 3 },
  { id: 4, name: "English", marks: "", credits: 2 },
];

let nextId = 5;

export default function App() {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCredits, setNewSubjectCredits] = useState(3);

  const handleMarksChange = useCallback((id, value) => {
    if (value !== "" && (Number(value) < 0 || Number(value) > 100)) return;
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks: value } : s))
    );
  }, []);

  const handleNameChange = useCallback((id, value) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: value } : s))
    );
  }, []);

  const handleCreditsChange = useCallback((id, value) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, credits: Number(value) } : s))
    );
  }, []);

  const addSubject = useCallback(() => {
    if (!newSubjectName.trim()) return;
    setSubjects((prev) => [
      ...prev,
      { id: nextId++, name: newSubjectName.trim(), marks: "", credits: newSubjectCredits },
    ]);
    setNewSubjectName("");
    setNewSubjectCredits(3);
  }, [newSubjectName, newSubjectCredits]);

  const removeSubject = useCallback((id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSubjects((prev) => prev.map((s) => ({ ...s, marks: "" })));
  }, []);

  const filled = subjects.filter((s) => s.marks !== "" && !isNaN(s.marks));
  const totalCredits = filled.reduce((acc, s) => acc + s.credits, 0);
  const cgpa =
    totalCredits > 0
      ? filled.reduce((acc, s) => {
          const g = getGradeInfo(s.marks);
          return acc + (g ? g.point * s.credits : 0);
        }, 0) / totalCredits
      : null;
  const avg =
    filled.length > 0
      ? filled.reduce((acc, s) => acc + Number(s.marks), 0) / filled.length
      : null;
  const highest = filled.length > 0 ? Math.max(...filled.map((s) => Number(s.marks))) : null;
  const lowest = filled.length > 0 ? Math.min(...filled.map((s) => Number(s.marks))) : null;
  const passCount = filled.filter((s) => Number(s.marks) >= 40).length;
  const failCount = filled.filter((s) => Number(s.marks) < 40).length;

  const gradeColor = (grade) => {
    const map = {
      O: "#00e5a0", "A+": "#4fc3f7", A: "#7986cb", "B+": "#ffb74d",
      B: "#ff8a65", C: "#ef9a9a", F: "#f44336",
    };
    return map[grade] || "#888";
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        input, select { outline: none; }
        .row-card:hover { background: #1a1a2e !important; }
        .remove-btn:hover { background: #f4433630 !important; color: #f44336 !important; }
        .add-btn:hover { background: #00e5a020 !important; }
        .clear-btn:hover { background: #ffffff10 !important; }
        input:focus { border-color: #00e5a0 !important; }
        select:focus { border-color: #00e5a0 !important; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        .stat-card { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.badge}>ACADEMIC TRACKER</div>
          <h1 style={styles.title}>Marks & Grade<br /><span style={styles.titleAccent}>Dashboard</span></h1>
          <p style={styles.subtitle}>Track your subject-wise performance and CGPA in real-time</p>
        </div>

        {filled.length > 0 && (
          <div style={styles.statsGrid}>
            <StatCard label="Average" value={avg !== null ? avg.toFixed(1) : "—"} sub="out of 100" delay="0s" color="#4fc3f7" />
            <StatCard label="CGPA" value={cgpa !== null ? cgpa.toFixed(2) : "—"} sub={cgpa !== null ? getCGPALabel(cgpa) : ""} delay="0.1s" color="#00e5a0" big />
            <StatCard label="Highest" value={highest !== null ? highest : "—"} sub="marks scored" delay="0.2s" color="#ffb74d" />
            <StatCard label="Pass / Fail" value={`${passCount} / ${failCount}`} sub={`of ${filled.length} subjects`} delay="0.3s" color="#7986cb" />
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Subject Records</span>
            <button style={styles.clearBtn} className="clear-btn" onClick={clearAll}>
              Reset Marks
            </button>
          </div>

          <div style={styles.colLabels}>
            <span style={{ flex: 2 }}>Subject Name</span>
            <span style={{ width: 70, textAlign: "center" }}>Credits</span>
            <span style={{ width: 110, textAlign: "center" }}>Marks /100</span>
            <span style={{ width: 80, textAlign: "center" }}>Grade</span>
            <span style={{ width: 100, textAlign: "center" }}>Grade Pt.</span>
            <span style={{ width: 40 }}></span>
          </div>

          {subjects.map((subject, i) => {
            const gInfo = getGradeInfo(subject.marks);
            return (
              <div
                key={subject.id}
                className="row-card"
                style={{ ...styles.row, animationDelay: `${i * 0.05}s`, animation: "fadeIn 0.3s ease both" }}
              >
                <input
                  style={{ ...styles.inputBase, flex: 2 }}
                  value={subject.name}
                  onChange={(e) => handleNameChange(subject.id, e.target.value)}
                  placeholder="Subject name"
                />
                <select
                  style={{ ...styles.inputBase, width: 70, textAlign: "center" }}
                  value={subject.credits}
                  onChange={(e) => handleCreditsChange(subject.id, e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  style={{ ...styles.inputBase, width: 110, textAlign: "center" }}
                  type="number"
                  min={0}
                  max={100}
                  value={subject.marks}
                  onChange={(e) => handleMarksChange(subject.id, e.target.value)}
                  placeholder="0–100"
                />
                <div style={{ width: 80, textAlign: "center" }}>
                  {gInfo ? (
                    <span style={{ ...styles.gradeBadge, background: gradeColor(gInfo.grade) + "25", color: gradeColor(gInfo.grade), borderColor: gradeColor(gInfo.grade) + "60" }}>
                      {gInfo.grade}
                    </span>
                  ) : <span style={{ color: "#333" }}>—</span>}
                </div>
                <div style={{ width: 100, textAlign: "center", color: gInfo ? gradeColor(gInfo.grade) : "#333", fontFamily: "'Space Mono', monospace", fontSize: 14 }}>
                  {gInfo ? gInfo.point.toFixed(1) : "—"}
                </div>
                <button
                  className="remove-btn"
                  style={styles.removeBtn}
                  onClick={() => removeSubject(subject.id)}
                >×</button>
              </div>
            );
          })}

          <div style={styles.addRow}>
            <input
              style={{ ...styles.inputBase, flex: 2 }}
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name..."
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
            />
            <select
              style={{ ...styles.inputBase, width: 70, textAlign: "center" }}
              value={newSubjectCredits}
              onChange={(e) => setNewSubjectCredits(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button style={styles.addBtn} className="add-btn" onClick={addSubject}>
              + Add Subject
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Grading Scale</span>
          </div>
          <div style={styles.gradeScale}>
            {GRADE_THRESHOLDS.map((t) => (
              <div key={t.grade} style={styles.scaleItem}>
                <span style={{ ...styles.gradeBadge, background: gradeColor(t.grade) + "20", color: gradeColor(t.grade), borderColor: gradeColor(t.grade) + "50", fontSize: 13 }}>
                  {t.grade}
                </span>
                <span style={styles.scaleRange}>≥{t.min}%</span>
                <span style={styles.scaleLabel}>{t.label}</span>
                <span style={styles.scalePoint}>{t.point}.0 pts</span>
              </div>
            ))}
          </div>
        </div>

        {cgpa !== null && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>CGPA Progress</span>
              <span style={{ fontFamily: "'Space Mono', monospace", color: "#00e5a0", fontSize: 18 }}>{cgpa.toFixed(2)} / 10.0</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${(cgpa / 10) * 100}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#444", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
              {[0, 2, 4, 5, 6, 7, 8, 9, 10].map((n) => <span key={n}>{n}</span>)}
            </div>
          </div>
        )}

        <p style={styles.footer}>Built with React · useState & props · Event Handling</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, delay, color, big }) {
  return (
    <div className="stat-card" style={{ ...styles.statCard, animationDelay: delay, borderColor: color + "30" }}>
      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: big ? 36 : 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#444", marginTop: 6, fontFamily: "'Space Mono', monospace" }}>{sub}</div>}
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    fontFamily: "'Syne', sans-serif",
    color: "#e0e0e0",
    padding: "40px 16px",
  },
  container: { maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
  header: { textAlign: "center", paddingBottom: 8 },
  badge: {
    display: "inline-block", fontSize: 10, letterSpacing: 4, color: "#00e5a0",
    border: "1px solid #00e5a030", borderRadius: 4, padding: "4px 12px", marginBottom: 16,
    fontFamily: "'Space Mono', monospace",
  },
  title: { fontSize: 42, fontWeight: 800, lineHeight: 1.15, color: "#fff" },
  titleAccent: { color: "#00e5a0" },
  subtitle: { color: "#444", marginTop: 12, fontSize: 14, fontFamily: "'Space Mono', monospace" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  statCard: {
    background: "#111118", border: "1px solid #1e1e2e", borderRadius: 12,
    padding: "20px 16px", transition: "transform 0.2s",
  },
  card: { background: "#111118", border: "1px solid #1e1e2e", borderRadius: 14, overflow: "hidden" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1a1a28" },
  cardTitle: { fontWeight: 700, fontSize: 14, letterSpacing: 1, color: "#ccc", textTransform: "uppercase" },
  colLabels: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 20px",
    fontSize: 10, letterSpacing: 1.5, color: "#333", textTransform: "uppercase",
    fontFamily: "'Space Mono', monospace", borderBottom: "1px solid #141420",
  },
  row: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
    borderBottom: "1px solid #141420", background: "#111118", transition: "background 0.15s",
  },
  addRow: { display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#0d0d18" },
  inputBase: {
    background: "#0a0a14", border: "1px solid #1e1e30", borderRadius: 7,
    color: "#ddd", padding: "8px 10px", fontSize: 13, fontFamily: "'Space Mono', monospace",
    transition: "border-color 0.15s",
  },
  gradeBadge: {
    display: "inline-block", padding: "3px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 700, border: "1px solid", fontFamily: "'Space Mono', monospace",
  },
  removeBtn: {
    width: 32, height: 32, background: "transparent", border: "1px solid #1e1e30",
    borderRadius: 6, color: "#333", cursor: "pointer", fontSize: 16, transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    background: "transparent", border: "1px solid #00e5a040", borderRadius: 7,
    color: "#00e5a0", padding: "8px 16px", fontSize: 12, cursor: "pointer",
    fontFamily: "'Space Mono', monospace", transition: "background 0.15s", whiteSpace: "nowrap",
  },
  clearBtn: {
    background: "transparent", border: "1px solid #ffffff10", borderRadius: 6,
    color: "#444", padding: "5px 12px", fontSize: 11, cursor: "pointer",
    fontFamily: "'Space Mono', monospace", transition: "background 0.15s",
  },
  gradeScale: { display: "flex", flexDirection: "column", gap: 0 },
  scaleItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
    borderBottom: "1px solid #141420",
  },
  scaleRange: { color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 12, width: 50 },
  scaleLabel: { flex: 1, fontSize: 13, color: "#888" },
  scalePoint: { fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444" },
  progressTrack: { height: 10, background: "#1a1a28", borderRadius: 8, margin: "4px 20px 0", overflow: "hidden" },
  progressFill: {
    height: "100%", borderRadius: 8, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
    background: "linear-gradient(90deg, #00e5a0, #4fc3f7)",
  },
  footer: { textAlign: "center", color: "#252530", fontSize: 11, fontFamily: "'Space Mono', monospace", paddingTop: 8 },
};
