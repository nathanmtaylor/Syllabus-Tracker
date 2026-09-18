import ClassTracker from "./components/ClassTracker";
import PasswordGate from "./components/PasswordGate";

export default function Home() {
  return (
    <PasswordGate>
      <main className="page">
        <header className="app-header">
          <h1 className="app-title">Syllabus Tracker</h1>
          <p className="app-tagline">
            Paste a syllabus, get deadlines and a grade calculator.
          </p>
        </header>
        <ClassTracker />
      </main>
    </PasswordGate>
  );
}
