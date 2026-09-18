"use client";

import { useEffect, useState } from "react";
import DemoView from "./DemoView";
import { PASSWORD_STORAGE_KEY, getStoredPassword } from "@/lib/auth";

// Wraps the whole app. Nothing inside `children` renders until a correct
// password has been entered (or was already remembered from a previous
// visit). This is a convenience/UX layer only - the actual protection is
// the same-password check in app/api/extract/route.js, since that's the
// route that costs money to call.
export default function PasswordGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  // Not persisted anywhere on purpose - refreshing during the demo drops
  // you back to the password prompt, same as if you'd never clicked it.
  const [demo, setDemo] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Same reason as ClassTracker's localStorage read: this can only happen
  // in the browser, after the first render, not during the server render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(Boolean(getStoredPassword()));
    setChecking(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();

      if (!body.ok) {
        throw new Error("Incorrect password.");
      }

      localStorage.setItem(PASSWORD_STORAGE_KEY, password);
      setUnlocked(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return <p className="loading-text">Loading...</p>;
  }

  if (unlocked) {
    return children;
  }

  if (demo) {
    return (
      <main className="page">
        <header className="app-header">
          <h1 className="app-title">Syllabus Tracker</h1>
          <p className="app-tagline">
            Paste a syllabus, get deadlines and a grade calculator.
          </p>
        </header>
        <DemoView onExitDemo={() => setDemo(false)} />
      </main>
    );
  }

  return (
    <div className="password-gate">
      <div className="password-form">
        <h1 className="app-title">Syllabus Tracker</h1>
        <p className="subtitle">Enter the password to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          <button type="submit" className="extract-button" disabled={submitting}>
            {submitting ? "Checking..." : "Unlock"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <button
          type="button"
          className="link-button demo-link"
          onClick={() => setDemo(true)}
        >
          View demo instead
        </button>
      </div>
    </div>
  );
}
