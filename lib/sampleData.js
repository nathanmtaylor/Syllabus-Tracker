// Fake "extracted from a syllabus" data. Later, this exact shape will come
// back from the AI serverless function instead of being hard-coded here.
export const SAMPLE_SYLLABUS = {
  courseName: "Intro to Psychology (PSY 101)",

  // Each grading category and how much it's worth toward the final grade.
  // The `id` is how assignments below link back to a category.
  gradingBreakdown: [
    { id: "homework", name: "Homework", weight: 20 },
    { id: "project", name: "Project", weight: 25 },
    { id: "exams", name: "Exams", weight: 40 },
    { id: "participation", name: "Participation", weight: 15 },
  ],

  // Every graded item pulled out of the syllabus text.
  assignments: [
    {
      id: "a1",
      title: "Reading Reflection 1",
      categoryId: "homework",
      dueDate: "2026-09-10",
    },
    {
      id: "a2",
      title: "Problem Set 1",
      categoryId: "homework",
      dueDate: "2026-09-24",
    },
    {
      id: "a3",
      title: "Group Project Proposal",
      categoryId: "project",
      dueDate: "2026-10-01",
    },
    {
      id: "a4",
      title: "Problem Set 2",
      categoryId: "homework",
      dueDate: "2026-10-08",
    },
    {
      id: "a5",
      title: "Midterm Exam",
      categoryId: "exams",
      dueDate: "2026-10-15",
    },
    {
      id: "a6",
      title: "Final Paper",
      categoryId: "project",
      dueDate: "2026-11-20",
    },
    {
      id: "a7",
      title: "Final Exam",
      categoryId: "exams",
      dueDate: "2026-12-12",
    },
  ],
};
