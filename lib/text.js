// Used as a tab label when a syllabus has no stated course code - e.g.
// "Intro to Psychology (PSY 101)" -> "Intro to Psychology…". Cuts at the
// last word boundary rather than mid-word when it reasonably can.
export function shortenTitle(title, maxLength = 24) {
  if (!title || title.length <= maxLength) return title;

  const truncated = title.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 10 ? truncated.slice(0, lastSpace) : truncated;
  return cut.trim() + "…";
}
