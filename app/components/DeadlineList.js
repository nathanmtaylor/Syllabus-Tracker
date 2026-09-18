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

// `items` are already-resolved deadline rows - see lib/deadlines.js. When
// `showCourse` is true (the combined "All Classes" view), each row also
// shows which class it belongs to.
export default function DeadlineList({ items, showCourse = false }) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <ul className="deadline-list">
      {sorted.map((item) => {
        const days = daysUntil(item.dueDate);
        const urgency =
          days < 0 ? "overdue" : days <= 7 ? "soon" : "later";

        return (
          <li key={item.id} className={`deadline-item ${urgency}`}>
            <div className="deadline-main">
              <span className="deadline-title">{item.title}</span>
              <span className="deadline-category">
                {item.categoryName}
                {showCourse ? ` · ${item.courseName}` : ""}
              </span>
            </div>
            <div className="deadline-meta">
              <span>{item.dueDate}</span>
              <span className="deadline-status">{statusLabel(days)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
