export type SelfStudyProgress = {
  courseSlug: string;
  enrollmentId: string | null;
  enrolledAt: string | null;
  completedLessonKeys: string[];
  completedLessons: number;
  totalLessons: number;
};
