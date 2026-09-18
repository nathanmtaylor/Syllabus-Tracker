import { DEFAULT_CLASS_COLOR } from "./colors";
import { shortenTitle } from "./text";

// Fills in defaults for fields that might be missing - either because a
// class was saved by an older version of the app (before colors or tab
// labels existed), or because it's the hand-authored sample data. Applied
// every time a class is created or loaded, so every class object the rest
// of the app touches is guaranteed to have these fields.
export function normalizeClass(classData) {
  return {
    color: DEFAULT_CLASS_COLOR,
    ...classData,
    label:
      classData.label ||
      classData.courseCode?.trim() ||
      shortenTitle(classData.courseName),
  };
}
