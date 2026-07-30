import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, fromEvent, merge, map } from 'rxjs';
import { ExamSessionRepository } from './exam-session.repository';
import { ExamSessionStore } from '../state/exam-session.store';
import { ExamSession } from '../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../shared/models/answer-draft.model';

@Injectable({ providedIn: 'root' })
export class ExamSessionFacade {
  private readonly repository = inject(ExamSessionRepository);
  private readonly store = inject(ExamSessionStore);

  readonly isLoading = this.store.isLoading;
  readonly hasError = this.store.hasError;
  readonly exam = this.store.exam;
  readonly questions = this.store.questions;
  readonly session = this.store.session;
  readonly answers = this.store.answers;
  readonly answerVersions = this.store.answerVersions;
  readonly saveStatus = this.store.saveStatus;

  /** Bağlantı kesikken bekleyen, henüz sunucuya gönderilememiş cevaplar (sıralı kuyruk). */
  private readonly pendingQueue: { questionId: string; value: string; clientVersion: number; queuedAt: number }[] = [];
  readonly isOffline = signal(!navigator.onLine);

  constructor() {
    merge(
      fromEvent(window, 'offline').pipe(map(() => true)),
      fromEvent(window, 'online').pipe(map(() => false))
    ).subscribe((offline) => {
      this.isOffline.set(offline);
      if (!offline) {
        this.flushQueue();
      }
    });
  }

  /** Bağlantı yokken çağrılır: cevabı kaybetmeden yerel kuyruğa alır. */
  queueAnswerWhileOffline(questionId: string, value: string, clientVersion: number): void {
    this.setLocalAnswer(questionId, value);
    this.pendingQueue.push({ questionId, value, clientVersion, queuedAt: Date.now() });
  }

  /** Bağlantı geri geldiğinde kuyruktakileri SIRAYLA (queuedAt artan) sunucuya gönderir. */
  private flushQueue(): void {
    const sessionId = this.store.session()?.id;
    if (!sessionId || this.pendingQueue.length === 0) {
      return;
    }

    const ordered = [...this.pendingQueue].sort((a, b) => a.queuedAt - b.queuedAt);
    this.pendingQueue.length = 0;

    for (const item of ordered) {
      this.saveDraft(sessionId, item.questionId, item.value, item.clientVersion).subscribe();
    }
  }

  loadSessionByToken(token: string): void {
    this.store.startLoading();
    this.repository.getSessionByToken(token).subscribe({
      next: (session) => {
        if (!session) {
          this.store.setError();
          return;
        }
        this.store.setSession(session);

        this.repository.getExamById(session.examId).subscribe({
          next: (exam) => {
            if (!exam) {
              this.store.setError();
              return;
            }

            this.repository.getQuestionsByIds(exam.questionIds).subscribe({
              next: (questions) => {
                this.store.setExamAndQuestions(exam, questions);

                this.repository.getDraftsForSession(session.id).subscribe({
                  next: (drafts) => {
                    const answers: Record<string, string> = {};
                    const versions: Record<string, number> = {};
                    const statuses: Record<string, AnswerDraft['syncStatus']> = {};

                    for (const draft of drafts) {
                      if (typeof draft.answerValue === 'string') {
                        answers[draft.questionId] = draft.answerValue;
                      }
                      versions[draft.questionId] = draft.autosaveVersion;
                      statuses[draft.questionId] = draft.syncStatus;
                    }

                    this.store.setDraftState(answers, versions, statuses);
                  },
                  error: () => this.store.finishLoading(),
                });
              },
              error: () => this.store.setError(),
            });
          },
          error: () => this.store.setError(),
        });
      },
      error: () => this.store.setError(),
    });
  }

  loadExam(examId: string): void {
    this.store.startLoading();
    this.repository.getExamById(examId).subscribe({
      next: (exam) => {
        if (!exam) {
          this.store.setError();
          return;
        }

        this.repository.getQuestionsByIds(exam.questionIds).subscribe({
          next: (questions) => this.store.setExamAndQuestions(exam, questions),
          error: () => this.store.setError(),
        });
      },
      error: () => this.store.setError(),
    });
  }

  hasActiveSession(examId: string, studentId: string): boolean {
    return this.repository.hasActiveSession(examId, studentId);
  }

  getActiveSession(examId: string, studentId: string): ExamSession | undefined {
    return this.repository.getActiveSession(examId, studentId);
  }

  startSession(examId: string, studentId: string, durationMinutes: number): Observable<ExamSession> {
    return this.repository
      .startSession(examId, studentId, durationMinutes)
      .pipe(tap((session) => this.store.setSession(session)));
  }

  setLocalAnswer(questionId: string, value: string): void {
    this.store.setAnswer(questionId, value);
  }

  saveDraft(
    sessionId: string,
    questionId: string,
    value: string,
    clientVersion: number
  ): Observable<AnswerDraft> {
    return this.repository.saveDraft(sessionId, questionId, value, clientVersion).pipe(
      tap((draft) => {
        this.store.setDraftSaved(
          questionId,
          draft.syncStatus,
          draft.syncStatus === 'synced' ? draft.autosaveVersion : undefined
        );
      })
    );
  }

  submitSession(sessionId: string): Observable<ExamSession | undefined> {
    return this.repository.submitSession(sessionId).pipe(
      tap((updated) => {
        if (updated) {
          this.store.setSession(updated);
        }
      })
    );
  }
}