"use client";

import { useEffect, useState } from "react";
import AddClassForm from "./AddClassForm";
import ClassTab from "./ClassTab";
import ColorSwatchPicker from "./ColorSwatchPicker";
import DeadlineList from "./DeadlineList";
import GradeCalculator from "./GradeCalculator";
import { normalizeClass } from "@/lib/classes";
import { combineAllDeadlines, resolveClassDeadlines } from "@/lib/deadlines";
import { SAMPLE_SYLLABUS } from "@/lib/sampleData";

const STORAGE_KEY = "syllabus-tracker-classes";

export default function ClassTracker() {
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("add");
  // Becomes true once we've checked localStorage. Until then we don't know
  // whether the "real" list is empty or just hasn't loaded yet.
  const [loaded, setLoaded] = useState(false);

  // Runs once, after the page has already rendered in the browser.
  // localStorage doesn't exist while Next.js renders the page on the
  // server, so it can't be read inside useState - the server-rendered HTML
  // and the browser's first render would disagree about what's on screen,
  // which React treats as an error. Reading it here, after that first
  // render, avoids that.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        // Nothing saved yet - this is the very first visit. Seed one
        // example class so the UI isn't empty, same as the old demo.
        const seeded = [normalizeClass({ id: "sample", ...SAMPLE_SYLLABUS })];
        // This effect syncs state from an external, browser-only source
        // (localStorage), which can't be read any earlier than this.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClasses(seeded);
        setActiveTab("combined");
      } else {
        // Passed through normalizeClass too, so classes saved before
        // colors/labels existed still render correctly.
        const parsed = JSON.parse(saved).map(normalizeClass);
        setClasses(parsed);
        setActiveTab(parsed.length > 0 ? "combined" : "add");
      }
    } catch {
      // Corrupted storage, private browsing, etc. - just start fresh.
      setActiveTab("add");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Saves to localStorage every time `classes` changes - but only after
  // the load above has finished, so we don't overwrite already-saved data
  // with the empty starting array during that first render.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    } catch {
      // Storage full or unavailable - the app still works, it just won't persist.
    }
  }, [classes, loaded]);

  const handleExtracted = (classData) => {
    const newClass = normalizeClass({
      id: crypto.randomUUID(),
      ...classData,
      // The AI never reports completion status - every assignment starts
      // undone.
      assignments: classData.assignments.map((a) => ({ ...a, done: false })),
    });
    setClasses((prev) => [...prev, newClass]);
    setActiveTab(newClass.id);
  };

  const handleRename = (classId, label) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, label } : c))
    );
  };

  const handleColorChange = (classId, color) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, color } : c))
    );
  };

  const handleToggleDone = (classId, assignmentId) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id !== classId
          ? c
          : {
              ...c,
              assignments: c.assignments.map((a) =>
                a.id === assignmentId ? { ...a, done: !a.done } : a
              ),
            }
      )
    );
  };

  const handleSaveScale = (classId, scale) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, gradeScale: scale } : c))
    );
  };

  const handleDelete = (classId) => {
    const target = classes.find((c) => c.id === classId);
    if (!target) return;
    if (!window.confirm(`Delete "${target.courseName}"? This can't be undone.`)) {
      return;
    }

    const remaining = classes.filter((c) => c.id !== classId);
    setClasses(remaining);
    if (activeTab === classId) {
      setActiveTab(remaining.length > 0 ? "combined" : "add");
    }
  };

  if (!loaded) {
    return <p className="loading-text">Loading your classes...</p>;
  }

  const activeClass = classes.find((c) => c.id === activeTab);

  return (
    <div>
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === "combined" ? "active" : ""}`}
          onClick={() => setActiveTab("combined")}
        >
          All Classes
        </button>

        {classes.map((c) => (
          <ClassTab
            key={c.id}
            classData={c}
            active={activeTab === c.id}
            onSelect={() => setActiveTab(c.id)}
            onRename={(label) => handleRename(c.id, label)}
            onDelete={() => handleDelete(c.id)}
          />
        ))}

        <button
          className={`tab ${activeTab === "add" ? "active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          + Add Class
        </button>
      </div>

      {activeTab === "add" && <AddClassForm onExtracted={handleExtracted} />}

      {activeTab === "combined" && (
        <section>
          <h2>All Deadlines</h2>
          {classes.length === 0 ? (
            <p className="subtitle">No classes yet - add one to see deadlines here.</p>
          ) : (
            <DeadlineList
              items={combineAllDeadlines(classes)}
              showCourse
              onToggleDone={handleToggleDone}
            />
          )}
        </section>
      )}

      {activeClass && (
        <div className={`class-view class-color-${activeClass.color}`}>
          <h2>{activeClass.courseName}</h2>

          <div className="class-color-picker">
            <p className="field-label">Class color</p>
            <ColorSwatchPicker
              value={activeClass.color}
              onSelect={(color) => handleColorChange(activeClass.id, color)}
            />
          </div>

          <section>
            <h3>Deadlines</h3>
            <DeadlineList
              items={resolveClassDeadlines(activeClass)}
              onToggleDone={handleToggleDone}
            />
          </section>

          <section>
            <h3>Grade Calculator</h3>
            {/* Keyed by class id so switching classes always starts with
                blank inputs, instead of two classes that happen to share a
                category id (e.g. both using "homework") bleeding scores
                into each other. */}
            <GradeCalculator
              key={activeClass.id}
              categories={activeClass.gradingBreakdown}
              gradeScale={activeClass.gradeScale}
              onSaveScale={(scale) => handleSaveScale(activeClass.id, scale)}
            />
          </section>
        </div>
      )}
    </div>
  );
}
