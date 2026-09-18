// `gradeScale` looks like [{ letter: "A", min: 93 }, { letter: "A-", min: 90 }, ...].
// Returns the highest letter whose cutoff the percentage clears, or null if
// there's no scale, or the percentage falls below every cutoff in it.
export function percentageToLetter(percentage, gradeScale) {
  if (!gradeScale || gradeScale.length === 0) return null;

  const sortedHighestFirst = [...gradeScale].sort((a, b) => b.min - a.min);
  const match = sortedHighestFirst.find((tier) => percentage >= tier.min);
  return match ? match.letter : null;
}
