"use client";

import { useState } from "react";

// A small form for typing in letter-grade cutoffs by hand, for syllabi that
// never stated one. `onSave(scale)` receives the same shape the AI would
// have produced: [{ letter, min }, ...].
export default function GradeScaleEditor({ onSave, onCancel }) {
  const [rows, setRows] = useState([{ letter: "", min: "" }]);

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows((prev) => [...prev, { letter: "", min: "" }]);
  const removeRow = (index) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const scale = rows
      .filter((row) => row.letter.trim() !== "" && !isNaN(Number(row.min)))
      .map((row) => ({ letter: row.letter.trim(), min: Number(row.min) }))
      .sort((a, b) => b.min - a.min);

    if (scale.length === 0) return;
    onSave(scale);
  };

  return (
    <div className="grade-scale-editor">
      <p className="subtitle">Enter each letter grade and its minimum percentage.</p>
      {rows.map((row, i) => (
        <div key={i} className="grade-scale-row">
          <input
            type="text"
            placeholder="A-"
            className="grade-scale-letter"
            value={row.letter}
            onChange={(e) => updateRow(i, "letter", e.target.value)}
          />
          <input
            type="number"
            placeholder="90"
            className="grade-scale-min"
            value={row.min}
            onChange={(e) => updateRow(i, "min", e.target.value)}
          />
          <button
            type="button"
            className="tab-delete"
            onClick={() => removeRow(i)}
            aria-label="Remove row"
          >
            ×
          </button>
        </div>
      ))}
      <div className="grade-scale-actions">
        <button type="button" className="link-button" onClick={addRow}>
          + Add grade
        </button>
        <button type="button" className="extract-button" onClick={handleSave}>
          Save scale
        </button>
        <button type="button" className="link-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
