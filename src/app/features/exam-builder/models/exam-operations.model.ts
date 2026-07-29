import { BlueprintConstraint, ExamBlueprint } from '../../../shared/models/exam-blueprint.model';
import { Exam } from '../../../shared/models/exam.model';
import { Question } from '../../../shared/models/question.model';

export interface ConstraintCoverage {
  constraint: BlueprintConstraint;
  matchedQuestions: Question[];
  isSatisfied: boolean;
}

export interface PublishExamResult {
  success: boolean;
  error?: 'not_found' | 'already_published' | 'blueprint_not_satisfied';
}

export interface BlueprintWithCoverage {
  blueprint: ExamBlueprint;
  coverages: ConstraintCoverage[];
  isFullySatisfied: boolean;
  exams: Exam[];
}