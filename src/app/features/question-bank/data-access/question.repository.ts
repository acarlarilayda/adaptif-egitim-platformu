import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Question } from '../../../shared/models/question.model';
import { QuestionVersion } from '../../../shared/models/question-version.model';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';
import { MOCK_QUESTION_VERSIONS } from '../../../core/api/mock-data/question-versions.mock-data';

@Injectable({ providedIn: 'root' })
export class QuestionRepository {
  private questions: Question[] = [...MOCK_QUESTIONS];
  private questionVersions: QuestionVersion[] = [...MOCK_QUESTION_VERSIONS];

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

      this.questionVersions.push(newVersion);

      Object.assign(question, changes, {
        currentVersionId: newVersionId,
        version: newVersionNumber,
        updatedAt: new Date().toISOString(),
      });

      return question;
    });
  }
}