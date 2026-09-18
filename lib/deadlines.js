// Turns one class's assignments + grading categories into a flat list of
// items DeadlineList can render directly - it looks up each assignment's
// categoryId once here, so DeadlineList itself never needs to know about
// categories at all.
export function resolveClassDeadlines(classData) {
  const categoryName = (categoryId) =>
    classData.gradingBreakdown.find((c) => c.id === categoryId)?.name ??
    "Uncategorized";

  return classData.assignments.map((assignment) => ({
    // Prefixed with the class id so two classes' assignment ids (e.g. both
    // using "a1") can't collide once everything is merged together below.
    id: `${classData.id}-${assignment.id}`,
    // Kept separately (rather than only the combined id above) so a
    // checkbox click can be routed back to the right class + assignment.
    classId: classData.id,
    assignmentId: assignment.id,
    title: assignment.title,
    dueDate: assignment.dueDate,
    categoryName: categoryName(assignment.categoryId),
    // The short tab label, not the full course name - keeps combined-view
    // rows scannable instead of wrapping onto a second line on narrow
    // screens or long course titles.
    label: classData.label,
    color: classData.color,
    done: Boolean(assignment.done),
  }));
}

// Merges every class's deadlines into one list, each tagged with its course
// name, for the "All Classes" combined view.
export function combineAllDeadlines(classes) {
  return classes.flatMap(resolveClassDeadlines);
}
