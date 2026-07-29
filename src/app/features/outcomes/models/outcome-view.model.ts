import { Course } from '../../../shared/models/course.model';
import { LearningOutcome } from '../../../shared/models/learning-outcome.model';

export interface CourseWithOutcomes {
  course: Course;
  outcomes: LearningOutcome[];
}
