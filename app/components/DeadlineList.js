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

export default function DeadlineList({ assignments, categories }) {
  const categoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized";

  const sorted = [...assignments].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <ul className="deadline-list">
      {sorted.map((assignment) => {
        const days = daysUntil(assignment.dueDate);
        const urgency =
          days < 0 ? "overdue" : days <= 7 ? "soon" : "later";

        return (
          <li key={assignment.id} className={`deadline-item ${urgency}`}>
            <div className="deadline-main">
              <span className="deadline-title">{assignment.title}</span>
              <span className="deadline-category">
                {categoryName(assignment.categoryId)}
              </span>
            </div>
            <div className="deadline-meta">
              <span>{assignment.dueDate}</span>
              <span className="deadline-status">{statusLabel(days)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
