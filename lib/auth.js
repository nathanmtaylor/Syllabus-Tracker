// The password itself is stored in plain text in the browser's
// localStorage. That's intentional here - this is a lightweight gate to
// keep the app from being casually stumbled onto and running up your AI
// bill, not real authentication for protecting sensitive data.
export const PASSWORD_STORAGE_KEY = "syllabus-tracker-password";

export function getStoredPassword() {
  try {
    return localStorage.getItem(PASSWORD_STORAGE_KEY);
  } catch {
    return null;
  }
}
