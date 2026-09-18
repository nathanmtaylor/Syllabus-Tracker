"use client";

import { useState } from "react";
import DeadlineList from "./DeadlineList";
import GradeCalculator from "./GradeCalculator";
import { normalizeClass } from "@/lib/classes";
import { resolveClassDeadlines } from "@/lib/deadlines";
import { SAMPLE_SYLLABUS } from "@/lib/sampleData";

// Built once - SAMPLE_SYLLABUS and normalizeClass are both pure, so this
// never needs to be recomputed.
const DEMO_CLASS = normalizeClass({ id: "demo", ...SAMPLE_SYLLABUS });

// Everything in this component is local React state. It never imports or
// touches localStorage, and it never renders ClassTracker or AddClassForm
// (the only places that do) - so there is no code path by which anything
// that happens here could read, mix with, or overwrite a visitor's real
// saved classes. Checking a box or entering a grade just updates this
// component's own state and disappears on refresh.
export default function DemoView({ onExitDemo }) {
  const [assignments, setAssignments] = useState(DEMO_CLASS.assignments);

  const demoClass = { ...DEMO_CLASS, assignments };

  const handleToggleDone = (_classId, assignmentId) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, done: !a.done } : a))
    );
  };

  return (
    <div className={`class-view class-color-${demoClass.color}`}>
      <div className="demo-banner">
        <p>
          You&apos;re viewing a demo with sample data. Adding your own
          syllabus is turned off here.
        </p>
        <button type="button" className="link-button" onClick={onExitDemo}>
          Have a password? Enter it
        </button>
      </div>

      <h2>{demoClass.courseName}</h2>

      <section>
        <h3>Deadlines</h3>
        <DeadlineList
          items={resolveClassDeadlines(demoClass)}
          onToggleDone={handleToggleDone}
        />
      </section>

      <section>
        <h3>Grade Calculator</h3>
        <GradeCalculator
          categories={demoClass.gradingBreakdown}
          gradeScale={demoClass.gradeScale}
          onSaveScale={() => {}}
        />
      </section>
    </div>
  );
}
