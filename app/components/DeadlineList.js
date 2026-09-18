function daysUntil(dueDateString) {
  const due = new Date(dueDateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((due - today) / msPerDay);
}

function statusLabel(days) {
  if (days < 0) return "Past due";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function DeadlineItem({ item, showCourse, onToggleDone }) {
  const days = daysUntil(item.dueDate);
  const urgency = days < 0 ? "overdue" : days <= 7 ? "soon" : "later";

  return (
    <li
      className={`deadline-item ${item.done ? "done" : urgency} ${
        showCourse ? "with-swatch" : ""
      }`}
    >
      {showCourse && (
        <span
          className={`class-color-swatch class-color-${item.color}`}
          aria-hidden="true"
        />
      )}
      <input
        type="checkbox"
        className="deadline-checkbox"
        checked={item.done}
        onChange={() => onToggleDone(item.classId, item.assignmentId)}
        aria-label={`Mark "${item.title}" as done`}
      />
      <div className="deadline-main">
        <span className="deadline-title">{item.title}</span>
        <span className="deadline-category">
          {item.categoryName}
          {showCourse ? ` · ${item.label}` : ""}
        </span>
      </div>
      <div className="deadline-meta">
        <span>{item.dueDate}</span>
        <span className="deadline-status">
          {item.done ? "Done" : statusLabel(days)}
        </span>
      </div>
    </li>
  );
}

// `items` are already-resolved deadline rows - see lib/deadlines.js. When
// `showCourse` is true (the combined "All Classes" view), each row also
// shows which class it belongs to. Completed items move into their own
// section below so the active list stays focused on what's left to do.
export default function DeadlineList({ items, showCourse = false, onToggleDone }) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );
  const pending = sorted.filter((item) => !item.done);
  const completed = sorted.filter((item) => item.done);

  return (
    <div>
      <ul className="deadline-list">
        {pending.map((item) => (
          <DeadlineItem
            key={item.id}
            item={item}
            showCourse={showCourse}
            onToggleDone={onToggleDone}
          />
        ))}
      </ul>

      {completed.length > 0 && (
        <div className="completed-section">
          <h3>Completed</h3>
          <ul className="deadline-list">
            {completed.map((item) => (
              <DeadlineItem
                key={item.id}
                item={item}
                showCourse={showCourse}
                onToggleDone={onToggleDone}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
