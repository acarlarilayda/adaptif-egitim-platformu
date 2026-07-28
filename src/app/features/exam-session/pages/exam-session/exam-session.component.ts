import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamSessionRepository } from '../../data-access/exam-session.repository';
import { AuthService } from '../../../../core/auth/auth.service';
import { Exam } from '../../../../shared/models/exam.model';
import { Question } from '../../../../shared/models/question.model';
import { ExamSession } from '../../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../../shared/models/answer-draft.model';
import { ExamTimerComponent } from '../../../../shared/components/exam-timer/exam-timer.component';

@Component({
  selector: 'app-exam-session',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamTimerComponent],
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

  constructor(
    private readonly examSessionRepository: ExamSessionRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExam();
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

  submitExam(): void {
    const session = this.session();
    if (!session) return;

    this.examSessionRepository.submitSession(session.id).subscribe({
      next: (updated) => {
        if (updated) {
          this.session.set(updated);
        }
      },
    });
  }
}