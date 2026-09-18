"use client";

import { useEffect, useState } from "react";
import AddClassForm from "./AddClassForm";
import DeadlineList from "./DeadlineList";
import GradeCalculator from "./GradeCalculator";
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
        const seeded = [{ id: "sample", ...SAMPLE_SYLLABUS }];
        setClasses(seeded);
        setActiveTab("combined");
      } else {
        const parsed = JSON.parse(saved);
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
    const newClass = { id: crypto.randomUUID(), ...classData };
    setClasses((prev) => [...prev, newClass]);
    setActiveTab(newClass.id);
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
          <div key={c.id} className={`tab ${activeTab === c.id ? "active" : ""}`}>
            <button className="tab-label" onClick={() => setActiveTab(c.id)}>
              {c.courseName}
            </button>
            <button
              className="tab-delete"
              onClick={() => handleDelete(c.id)}
              aria-label={`Delete ${c.courseName}`}
            >
              ×
            </button>
          </div>
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
            <DeadlineList items={combineAllDeadlines(classes)} showCourse />
          )}
        </section>
      )}

      {activeClass && (
        <div>
          <h1>{activeClass.courseName}</h1>

          <section>
            <h2>Deadlines</h2>
            <DeadlineList items={resolveClassDeadlines(activeClass)} />
          </section>

          <section>
            <h2>Grade Calculator</h2>
            {/* Keyed by class id so switching classes always starts with
                blank inputs, instead of two classes that happen to share a
                category id (e.g. both using "homework") bleeding scores
                into each other. */}
            <GradeCalculator key={activeClass.id} categories={activeClass.gradingBreakdown} />
          </section>
        </div>
      )}
    </div>
  );
}
