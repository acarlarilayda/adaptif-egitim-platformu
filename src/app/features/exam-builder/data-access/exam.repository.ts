import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Exam } from '../../../shared/models/exam.model';
import { ExamBlueprint, BlueprintConstraint } from '../../../shared/models/exam-blueprint.model';
import { Question } from '../../../shared/models/question.model';
import { MOCK_EXAMS } from '../../../core/api/mock-data/exams.mock-data';
import { MOCK_EXAM_BLUEPRINTS } from '../../../core/api/mock-data/exam-blueprints.mock-data';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';

export interface ConstraintCoverage {
  constraint: BlueprintConstraint;
  matchedQuestions: Question[];
  isSatisfied: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExamRepository {
  private exams: Exam[] = [...MOCK_EXAMS];
  private blueprints: ExamBlueprint[] = [...MOCK_EXAM_BLUEPRINTS];
  private questions: Question[] = [...MOCK_QUESTIONS];

  getExams(): Observable<Exam[]> {
    return mockRequest(() => [...this.exams]);
  }

  getBlueprints(): Observable<ExamBlueprint[]> {
    return mockRequest(() => [...this.blueprints]);
  }

  /**
   * Her kısıt için mevcut soru bankasında kaç uygun soru olduğunu
   * hesaplar. "Blueprint hedefleri karşılanmadan
   * sınav yayınlanamaz."
   */
  getCoverageForBlueprint(blueprint: ExamBlueprint): ConstraintCoverage[] {
    return blueprint.constraints.map((constraint) => {
      const matchedQuestions = this.questions.filter(
        (q) =>
          q.outcomeId === constraint.outcomeId &&
          q.difficulty === constraint.difficulty &&
          q.type === constraint.questionType &&
          q.publishStatus === 'published'
      );

      return {
        constraint,
        matchedQuestions,
        isSatisfied: matchedQuestions.length >= constraint.requiredCount,
      };
    });
  }

  isBlueprintFullySatisfied(blueprint: ExamBlueprint): boolean {
    return this.getCoverageForBlueprint(blueprint).every((c) => c.isSatisfied);
  }
}