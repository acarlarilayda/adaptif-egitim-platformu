import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Question } from '../../../shared/models/question.model';
import { QuestionVersion } from '../../../shared/models/question-version.model';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';
import { MOCK_QUESTION_VERSIONS } from '../../../core/api/mock-data/question-versions.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';

export interface PublishQuestionResult {
  success: boolean;
  error?: 'not_found' | 'already_published';
}

@Injectable({ providedIn: 'root' })
export class QuestionRepository {
  private readonly auditLog = inject(AuditLogService);

  private questions: Question[] = MOCK_QUESTIONS.map((q) => ({
    ...q,
    options: q.options.map((o) => ({ ...o })),
    tags: [...q.tags],
  }));

  private questionVersions: QuestionVersion[] = MOCK_QUESTION_VERSIONS.map((v) => ({
    ...v,
    options: v.options.map((o) => ({ ...o })),
  }));

  getQuestions(): Observable<Question[]> {
    return mockRequest(() => [...this.questions]);
  }

  getQuestionById(id: string): Observable<Question | undefined> {
    return mockRequest(() => this.questions.find((q) => q.id === id));
  }

  getVersionsForQuestion(questionId: string): Observable<QuestionVersion[]> {
    return mockRequest(() =>
      this.questionVersions.filter((v) => v.questionId === questionId)
    );
  }

  /**
   * "Yayınlanmış soru veya sınav doğrudan
   * değiştirilemez; yeni versiyon gerekir."
   * Bu metod, bir sorunun düzenlenip düzenlenemeyeceğini kontrol eder.
   */
  canEditDirectly(question: Question): boolean {
    return question.publishStatus !== 'published';
  }

  /**
   * Yayınlanmış bir soru düzenlenmek istendiğinde çağrılır:
   * yeni bir versiyon kaydı oluşturur, soruyu günceller ve
   * versiyon sayacını artırır. Doğrudan üzerine yazmaz.
   */
  createNewVersion(
    questionId: string,
    changes: Partial<Pick<Question, 'stem' | 'options' | 'difficulty' | 'points'>>,
    changeNote: string
  ): Observable<Question | undefined> {
    return mockRequest(() => {
      const question = this.questions.find((q) => q.id === questionId);
      if (!question) {
        return undefined;
      }

      const newVersionNumber = question.version + 1;
      const newVersionId = `qv-${questionId}-${newVersionNumber}`;

      const newVersion: QuestionVersion = {
        id: newVersionId,
        questionId,
        versionNumber: newVersionNumber,
        type: question.type,
        stem: changes.stem ?? question.stem,
        options: changes.options ?? question.options,
        difficulty: changes.difficulty ?? question.difficulty,
        points: changes.points ?? question.points,
        changeNote,
        createdAt: new Date().toISOString(),
      };

      this.questionVersions = [...this.questionVersions, newVersion];

      this.questions = this.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              ...changes,
              currentVersionId: newVersionId,
              version: newVersionNumber,
              updatedAt: new Date().toISOString(),
            }
          : q
      );

      return this.questions.find((q) => q.id === questionId);
    });
  }

  /**
   * Bir taslak soruyu yayına alır ve audit event üretir.
   * Zaten yayınlanmış bir soru tekrar yayınlanamaz (bunun için
   * createNewVersion + yeniden yayın akışı kullanılmalı).
   */
  publish(questionId: string, userId: string): PublishQuestionResult {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      return { success: false, error: 'not_found' };
    }

    if (question.publishStatus === 'published') {
      return { success: false, error: 'already_published' };
    }

    const previousValue = question.publishStatus;

    this.questions = this.questions.map((q) =>
      q.id === questionId
        ? { ...q, publishStatus: 'published', updatedAt: new Date().toISOString() }
        : q
    );

    this.auditLog.record({
      type: 'publish',
      userId,
      targetRecordId: question.id,
      targetRecordType: 'Question',
      previousValue,
      newValue: 'published',
      reason: `"${question.stem.slice(0, 60)}" sorusu yayına alındı.`,
    });

    return { success: true };
  }
}