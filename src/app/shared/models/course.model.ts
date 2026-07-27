export type CoursePublishStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  term: string;
  instructorId: string;
  publishStatus: CoursePublishStatus;
  outcomeIds: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}