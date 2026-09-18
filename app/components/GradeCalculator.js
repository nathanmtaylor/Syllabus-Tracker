"use client";

import { useState } from "react";
import GradeScaleEditor from "./GradeScaleEditor";
import { percentageToLetter } from "@/lib/grades";

export default function GradeCalculator({ categories, gradeScale, onSaveScale }) {
  // Tracks what the user typed into each category's score box, keyed by
  // category id. Starts empty since they haven't entered anything yet.
  const [scores, setScores] = useState({});
  const [editingScale, setEditingScale] = useState(false);
  const hasScale = Boolean(gradeScale && gradeScale.length > 0);

  const handleChange = (categoryId, value) => {
    setScores((prev) => ({ ...prev, [categoryId]: value }));
  };

  // Only count categories where the user actually typed a valid number.
  const entered = categories.filter((c) => {
    const value = scores[c.id];
    return value !== undefined && value !== "" && !isNaN(Number(value));
  });

  const weightEntered = entered.reduce((sum, c) => sum + c.weight, 0);
  const weightedPoints = entered.reduce(
    (sum, c) => sum + c.weight * Number(scores[c.id]),
    0
  );
  const currentGrade = weightEntered > 0 ? weightedPoints / weightEntered : null;
  const letterGrade =
    currentGrade !== null ? percentageToLetter(currentGrade, gradeScale) : null;

  return (
    <div>
      <table className="grade-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Weight</th>
            <th>Your score (%)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.weight}%</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 90"
                  value={scores[category.id] ?? ""}
                  onChange={(e) => handleChange(category.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grade-result">
        {currentGrade === null ? (
          <p>Enter a score above to see your current grade.</p>
        ) : (
          <p>
            Current grade: <strong>{currentGrade.toFixed(1)}%</strong>
            {letterGrade && <strong className="letter-grade"> ({letterGrade})</strong>}{" "}
            <span className="grade-note">
              (based on {weightEntered}% of your final grade so far)
            </span>
          </p>
        )}

        {!hasScale && !editingScale && (
          <p className="grade-note">
            This syllabus didn&apos;t specify a letter grade scale.{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setEditingScale(true)}
            >
              Enter one manually
            </button>
          </p>
        )}

        {editingScale && (
          <GradeScaleEditor
            onSave={(scale) => {
              onSaveScale(scale);
              setEditingScale(false);
            }}
            onCancel={() => setEditingScale(false)}
          />
        )}
      </div>
    </div>
  );
}
