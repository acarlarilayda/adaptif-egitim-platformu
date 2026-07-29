import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Exam } from '../../../shared/models/exam.model';
import { ExamBlueprint, BlueprintConstraint } from '../../../shared/models/exam-blueprint.model';
import { Question } from '../../../shared/models/question.model';
import { MOCK_EXAMS } from '../../../core/api/mock-data/exams.mock-data';
import { MOCK_EXAM_BLUEPRINTS } from '../../../core/api/mock-data/exam-blueprints.mock-data';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { ConstraintCoverage, PublishExamResult } from '../models/exam-operations.model';

@Injectable({ providedIn: 'root' })
export class ExamRepository {
  private readonly auditLog = inject(AuditLogService);

  private exams: Exam[] = MOCK_EXAMS.map((e) => ({
    ...e,
    questionIds: [...e.questionIds],
    rules: { ...e.rules },
  }));

  private blueprints: ExamBlueprint[] = MOCK_EXAM_BLUEPRINTS.map((b) => ({
    ...b,
    constraints: b.constraints.map((c) => ({ ...c })),
  }));

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

  /**
   * Blueprint hedefleri karşılanmadan sınav yayınlanamaz.
   * Başarılı yayında audit event üretir.
   */
  publish(examId: string, userId: string): PublishExamResult {
    const exam = this.exams.find((e) => e.id === examId);
    if (!exam) {
      return { success: false, error: 'not_found' };
    }

    if (exam.publishStatus === 'published') {
      return { success: false, error: 'already_published' };
    }

    const blueprint = this.blueprints.find((b) => b.id === exam.blueprintId);
    if (!blueprint || !this.isBlueprintFullySatisfied(blueprint)) {
      return { success: false, error: 'blueprint_not_satisfied' };
    }

    const previousValue = exam.publishStatus;

    this.exams = this.exams.map((e) =>
      e.id === examId
        ? { ...e, publishStatus: 'published' as const, updatedAt: new Date().toISOString() }
        : e
    );

    this.auditLog.record({
      type: 'publish',
      userId,
      targetRecordId: exam.id,
      targetRecordType: 'Exam',
      previousValue,
      newValue: 'published',
      reason: `"${exam.title}" sınavı yayına alındı.`,
    });

    return { success: true };
  }
}