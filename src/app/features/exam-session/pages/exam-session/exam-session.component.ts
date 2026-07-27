import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ExamSessionRepository } from '../../data-access/exam-session.repository';
import { AuthService } from '../../../../core/auth/auth.service';
import { Exam } from '../../../../shared/models/exam.model';
import { Question } from '../../../../shared/models/question.model';
import { ExamSession } from '../../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../../shared/models/answer-draft.model';

@Component({
  selector: 'app-exam-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-session.component.html',
  styleUrl: './exam-session.component.scss',
})
export class ExamSessionComponent implements OnInit, OnDestroy {
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
  readonly remainingSeconds = signal(0);

  // Demo amaçlı sabit bir sınav id'si kullanıyoruz; gerçek bir uygulamada
  // bu değer route parametresinden gelirdi.
  private readonly examId = 'exam-1';
  private timerSubscription: Subscription | null = null;

  readonly currentQuestion = computed(() => {
    const list = this.questions();
    return list.length > 0 ? list[this.currentIndex()] : null;
  });

  readonly formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor(
    private readonly examSessionRepository: ExamSessionRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExam();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
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
          this.remainingSeconds.set(session.remainingSeconds);
          this.startTimer();
        },
      });
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      const current = this.remainingSeconds();
      if (current <= 0) {
        this.timerSubscription?.unsubscribe();
        this.submitExam();
        return;
      }
      this.remainingSeconds.set(current - 1);
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

  submitExam(): void {
    const session = this.session();
    if (!session) return;

    this.examSessionRepository.submitSession(session.id).subscribe({
      next: (updated) => {
        if (updated) {
          this.session.set(updated);
        }
        this.timerSubscription?.unsubscribe();
      },
    });
  }
}