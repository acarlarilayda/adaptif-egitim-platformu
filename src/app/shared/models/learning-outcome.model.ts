export interface LearningOutcome {
  id: string;
  courseId: string;
  title: string;
  description: string;
  level: number;
  prerequisiteIds: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}