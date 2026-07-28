import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { ExamSession } from '../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../shared/models/answer-draft.model';
import { Exam } from '../../../shared/models/exam.model';
import { Question } from '../../../shared/models/question.model';
import { MOCK_EXAM_SESSIONS } from '../../../core/api/mock-data/exam-sessions.mock-data';
import { MOCK_ANSWER_DRAFTS } from '../../../core/api/mock-data/answer-drafts.mock-data';
import { MOCK_EXAMS } from '../../../core/api/mock-data/exams.mock-data';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';

@Injectable({ providedIn: 'root' })
export class ExamSessionRepository {
  private readonly auditLog = inject(AuditLogService);

  private sessions: ExamSession[] = MOCK_EXAM_SESSIONS.map((s) => ({
    ...s,
    flaggedQuestionIds: [...s.flaggedQuestionIds],
  }));
  private drafts: AnswerDraft[] = MOCK_ANSWER_DRAFTS.map((d) => ({ ...d }));
  private exams: Exam[] = [...MOCK_EXAMS];
  private questions: Question[] = [...MOCK_QUESTIONS];

  getExamById(examId: string): Observable<Exam | undefined> {
    return mockRequest(() => this.exams.find((e) => e.id === examId));
  }

  getQuestionsByIds(ids: string[]): Observable<Question[]> {
    return mockRequest(() => this.questions.filter((q) => ids.includes(q.id)));
  }

  // Bir öğrencinin aynı sınav için ikinci bir oturum açmasını engellemek amacıyla,
  // yeni oturum başlatılmadan önce zaten aktif bir oturum olup olmadığına bakılır.
  hasActiveSession(examId: string, studentId: string): boolean {
    return this.sessions.some(
      (s) => s.examId === examId && s.studentId === studentId && s.status === 'active'
    );
  }

  startSession(examId: string, studentId: string, durationMinutes: number): Observable<ExamSession> {
    return mockRequest(() => {
      const now = new Date().toISOString();
      const session: ExamSession = {
        id: `session-${Date.now()}`,
        token: `tok-${Math.random().toString(36).slice(2)}`,
        examId,
        studentId,
        startedAt: now,
        serverReferenceTime: now,
        remainingSeconds: durationMinutes * 60,
        status: 'active',
        currentQuestionIndex: 0,
        flaggedQuestionIds: [],
        lastSyncedAt: now,
      };
      this.sessions = [...this.sessions, session];
      return session;
    });
  }

  getDraftsForSession(sessionId: string): Observable<AnswerDraft[]> {
    return mockRequest(() => this.drafts.filter((d) => d.sessionId === sessionId));
  }

  // Autosave isteği, istemcinin bildiği versiyondan daha yeni bir kayıtla
  // karşılaşırsa cevabın üzerine sessizce yazmak yerine çakışma durumu döner.
  // Böylece kullanıcı iki farklı sekmeden aynı soruyu değiştirdiğinde veri kaybı yaşanmaz.
  saveDraft(
    sessionId: string,
    questionId: string,
    answerValue: string | string[],
    clientVersion: number
  ): Observable<AnswerDraft> {
    return mockRequest(() => {
      const existing = this.drafts.find(
        (d) => d.sessionId === sessionId && d.questionId === questionId
      );

      if (existing && existing.autosaveVersion > clientVersion) {
        return { ...existing, syncStatus: 'conflict' as const };
      }

      const newVersion = existing ? existing.autosaveVersion + 1 : 1;
      const draft: AnswerDraft = {
        id: existing ? existing.id : `draft-${Date.now()}`,
        sessionId,
        questionId,
        answerValue,
        autosaveVersion: newVersion,
        syncStatus: 'synced',
        savedAt: new Date().toISOString(),
      };

      this.drafts = existing
        ? this.drafts.map((d) => (d.id === existing.id ? draft : d))
        : [...this.drafts, draft];

      return draft;
    });
  }

  /**
   * Oturum sonlandırma her zaman audit event üretmelidir.
   */
  submitSession(sessionId: string): Observable<ExamSession | undefined> {
    return mockRequest(() => {
      const session = this.sessions.find((s) => s.id === sessionId);
      if (!session) {
        return undefined;
      }

      const updatedSession: ExamSession = { ...session, status: 'submitted' };
      this.sessions = this.sessions.map((s) => (s.id === sessionId ? updatedSession : s));

      this.auditLog.record({
        type: 'session_terminated',
        userId: session.studentId,
        targetRecordId: session.id,
        targetRecordType: 'ExamSession',
        previousValue: session.status,
        newValue: 'submitted',
        reason: 'Sınav oturumu öğrenci tarafından sonlandırıldı.',
      });

      return updatedSession;
    });
  }
}