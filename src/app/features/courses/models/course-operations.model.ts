import { Course } from '../../../shared/models/course.model';

export interface CreateCourseResult {
  success: boolean;
  course?: Course;
  error?: 'title_required';
}

export interface PublishCourseResult {
  success: boolean;
  error?: 'not_found' | 'already_published' | 'unauthorized' | 'no_outcomes';
}