"use client";

import { useState } from "react";

// One tab in the tab bar for a saved class. Owns its own local UI state
// for renaming, since nothing outside this tab cares about it. Color is
// shown here (the dot) but changed elsewhere, in the class's own view -
// see the note on .tab-bar in globals.css for why.
export default function ClassTab({ classData, active, onSelect, onRename, onDelete }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(classData.label);

  const startEditing = () => {
    setLabelDraft(classData.label);
    setEditingLabel(true);
  };

  const commitRename = () => {
    const trimmed = labelDraft.trim();
    if (trimmed && trimmed !== classData.label) onRename(trimmed);
    setEditingLabel(false);
  };

  return (
    <div className={`tab class-color-${classData.color} ${active ? "active" : ""}`}>
      <span className="tab-color-dot" aria-hidden="true" />

      {editingLabel ? (
        <input
          className="tab-rename-input"
          value={labelDraft}
          autoFocus
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditingLabel(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="tab-label"
          onClick={onSelect}
          onDoubleClick={startEditing}
        >
          {classData.label}
        </button>
      )}

      <button
        type="button"
        className="tab-rename"
        onClick={startEditing}
        aria-label={`Rename ${classData.label}`}
      >
        ✎
      </button>
      <button
        type="button"
        className="tab-delete"
        onClick={onDelete}
        aria-label={`Delete ${classData.label}`}
      >
        ×
      </button>
    </div>
  );
}
