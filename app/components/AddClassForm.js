"use client";

import { useState } from "react";
import ColorSwatchPicker from "./ColorSwatchPicker";
import { DEFAULT_CLASS_COLOR } from "@/lib/colors";
import { PASSWORD_STORAGE_KEY, getStoredPassword } from "@/lib/auth";

// `onExtracted(classData)` is called with the parsed syllabus (plus the
// chosen color) once the serverless function returns successfully. This
// component doesn't know or care what happens to that data afterward -
// ClassTracker decides.
export default function AddClassForm({ onExtracted }) {
  const [syllabusText, setSyllabusText] = useState("");
  const [color, setColor] = useState(DEFAULT_CLASS_COLOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExtract = async () => {
    if (!syllabusText.trim()) {
      setError("Paste some syllabus text first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-password": getStoredPassword() ?? "",
        },
        body: JSON.stringify({ syllabusText }),
      });

      if (res.status === 401) {
        // The saved password is missing or no longer correct - clear it
        // and reload so the password gate asks again.
        localStorage.removeItem(PASSWORD_STORAGE_KEY);
        window.location.reload();
        return;
      }

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Something went wrong.");
      }

      onExtracted({ ...body, color });
      setSyllabusText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Add a class</h2>
      <p className="subtitle">Paste a syllabus below to add it as a new class.</p>

      <p className="field-label">Color</p>
      <ColorSwatchPicker value={color} onSelect={setColor} />

      <textarea
        className="syllabus-textarea"
        rows={10}
        placeholder="Paste your syllabus text here..."
        value={syllabusText}
        onChange={(e) => setSyllabusText(e.target.value)}
      />
      <button className="extract-button" onClick={handleExtract} disabled={loading}>
        {loading ? "Extracting..." : "Add class"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}
