import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamSessionRepository } from '../../data-access/exam-session.repository';
import { AuthService } from '../../../../core/auth/auth.service';
import { Exam } from '../../../../shared/models/exam.model';
import { Question } from '../../../../shared/models/question.model';
import { ExamSession } from '../../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../../shared/models/answer-draft.model';
import { ExamTimerComponent } from '../../../../shared/components/exam-timer/exam-timer.component';
import { AutosaveIndicatorComponent } from '../../../../shared/components/autosave-indicator/autosave-indicator.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exam-session',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamTimerComponent, AutosaveIndicatorComponent, ConfirmDialogComponent],
  templateUrl: './exam-session.component.html',
  styleUrl: './exam-session.component.scss',
})
export class ExamSessionComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly exam = signal<Exam | null>(null);
  readonly questions = signal<Question[]>([]);
  readonly session = signal<ExamSession | null>(null);
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, string>>({});
  readonly answerVersions = signal<Record<string, number>>({});
  readonly saveStatus = signal<Record<string, AnswerDraft['syncStatus']>>({});

  // Demo amaçlı sabit bir sınav id'si kullanıyoruz; gerçek bir uygulamada
  // bu değer route parametresinden gelirdi.
  private readonly examId = 'exam-1';

  readonly currentQuestion = computed(() => {
    const list = this.questions();
    return list.length > 0 ? list[this.currentIndex()] : null;
  });

  readonly isTimerRunning = computed(() => this.session()?.status === 'active');
  readonly isConfirmDialogOpen = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
    private readonly examSessionRepository: ExamSessionRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.loadSessionByToken(token);
    } else {
      this.loadExam();
    }
  }

  /**
   * URL'de bir oturum token'ı varsa (sayfa yenilendi/bookmark edildi),
   * o oturumu ve daha önce kaydedilmiş cevap taslaklarını geri yükler.
   */
  loadSessionByToken(token: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.examSessionRepository.getSessionByToken(token).subscribe({
      next: (session) => {
        if (!session) {
          this.hasError.set(true);
          this.isLoading.set(false);
          return;
        }
        this.session.set(session);

        this.examSessionRepository.getExamById(session.examId).subscribe({
          next: (exam) => {
            if (!exam) {
              this.hasError.set(true);
              this.isLoading.set(false);
              return;
            }
            this.exam.set(exam);

            this.examSessionRepository.getQuestionsByIds(exam.questionIds).subscribe({
              next: (questions) => {
                this.questions.set(questions);

                this.examSessionRepository.getDraftsForSession(session.id).subscribe({
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

                    this.answers.set(answers);
                    this.answerVersions.set(versions);
                    this.saveStatus.set(statuses);
                    this.isLoading.set(false);
                  },
                  error: () => this.isLoading.set(false),
                });
              },
              error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
              },
            });
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  loadExam(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.examSessionRepository.getExamById(this.examId).subscribe({
      next: (exam) => {
        if (!exam) {
          this.hasError.set(true);
          this.isLoading.set(false);
          return;
        }
        this.exam.set(exam);

        this.examSessionRepository.getQuestionsByIds(exam.questionIds).subscribe({
          next: (questions) => {
            this.questions.set(questions);
            this.isLoading.set(false);
            this.redirectToActiveSessionIfAny(exam.id);
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Öğrencinin bu sınav için zaten aktif bir oturumu varsa, boş bir
   * "başlat" ekranı göstermek yerine doğrudan o oturuma yönlendirir.
   */
  private redirectToActiveSessionIfAny(examId: string): void {
    const studentId = this.auth.currentUser().id;
    const activeSession = this.examSessionRepository.getActiveSession(examId, studentId);
    if (activeSession) {
      this.router.navigate(['/exam-session', activeSession.token], { replaceUrl: true });
    }
  }

  startExam(): void {
    const exam = this.exam();
    if (!exam) return;

    const studentId = this.auth.currentUser().id;

    if (this.examSessionRepository.hasActiveSession(exam.id, studentId)) {
      this.errorMessage.set(
        'Bu sınav için zaten aktif bir oturumunuz var. Aynı anda yalnızca bir oturum açabilirsiniz.'
      );
      return;
    }

    this.errorMessage.set(null);

    this.examSessionRepository
      .startSession(exam.id, studentId, exam.rules.durationMinutes)
      .subscribe({
        next: (session) => {
          this.session.set(session);
          this.router.navigate(['/exam-session', session.token], { replaceUrl: true });
        },
      });
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
  }

  onAnswerChange(questionId: string, value: string): void {
    this.answers.set({ ...this.answers(), [questionId]: value });

    const session = this.session();
    if (!session) return;

    const clientVersion = this.answerVersions()[questionId] ?? 0;

    this.examSessionRepository
      .saveDraft(session.id, questionId, value, clientVersion)
      .subscribe({
        next: (draft) => {
          this.saveStatus.set({ ...this.saveStatus(), [questionId]: draft.syncStatus });
          if (draft.syncStatus === 'synced') {
            this.answerVersions.set({
              ...this.answerVersions(),
              [questionId]: draft.autosaveVersion,
            });
          }
        },
      });
  }

  requestSubmit(): void {
    this.isConfirmDialogOpen.set(true);
  }

  cancelSubmit(): void {
    this.isConfirmDialogOpen.set(false);
  }

  submitExam(): void {
    const session = this.session();
    if (!session) return;

    this.isConfirmDialogOpen.set(false);

    this.examSessionRepository.submitSession(session.id).subscribe({
      next: (updated) => {
        if (updated) {
          this.session.set(updated);
        }
      },
    });
  }
}