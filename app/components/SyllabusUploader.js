"use client";

import { useState } from "react";
import DeadlineList from "./DeadlineList";
import GradeCalculator from "./GradeCalculator";

export default function SyllabusUploader({ initialData }) {
  const [syllabusText, setSyllabusText] = useState("");
  const [data, setData] = useState(initialData);
  const [isSample, setIsSample] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bumped on every successful extraction. Passed as GradeCalculator's
  // `key` below so React throws away its old input boxes and score state
  // instead of reusing them with a new, unrelated set of categories.
  const [extractionCount, setExtractionCount] = useState(0);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabusText }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Something went wrong.");
      }

      setData(body);
      setIsSample(false);
      setExtractionCount((count) => count + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section>
        <h2>Paste your syllabus</h2>
        <textarea
          className="syllabus-textarea"
          rows={10}
          placeholder="Paste your syllabus text here..."
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
        />
        <button
          className="extract-button"
          onClick={handleExtract}
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract assignments"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </section>

      <h1>{data.courseName}</h1>
      <p className="subtitle">
        {isSample
          ? "Showing sample data — paste a syllabus above to replace it."
          : "Extracted from your syllabus."}
      </p>

      <section>
        <h2>Deadlines</h2>
        <DeadlineList
          assignments={data.assignments}
          categories={data.gradingBreakdown}
        />
      </section>

      <section>
        <h2>Grade Calculator</h2>
        <GradeCalculator
          key={extractionCount}
          categories={data.gradingBreakdown}
        />
      </section>
    </div>
  );
}
