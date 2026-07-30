import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamSessionFacade } from '../../data-access/exam-session.facade';
import { AuthService } from '../../../../core/auth/auth.service';
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
  private readonly facade = inject(ExamSessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isLoading;
  readonly hasError = this.facade.hasError;
  readonly errorMessage = signal<string | null>(null);

  readonly exam = this.facade.exam;
  readonly questions = this.facade.questions;
  readonly session = this.facade.session;
  readonly answers = this.facade.answers;
  readonly answerVersions = this.facade.answerVersions;
  readonly saveStatus = this.facade.saveStatus;

  readonly currentIndex = signal(0);

  private readonly examId = 'exam-1';

  readonly currentQuestion = computed(() => {
    const list = this.questions();
    return list.length > 0 ? list[this.currentIndex()] : null;
  });

  readonly isTimerRunning = computed(() => this.session()?.status === 'active');
  readonly isOffline = this.facade.isOffline;
  readonly isConfirmDialogOpen = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.facade.loadSessionByToken(token);
    } else {
      this.loadExam();
    }
  }

  loadExam(): void {
    this.facade.loadExam(this.examId);
    this.redirectToActiveSessionIfAny(this.examId);
  }

  private redirectToActiveSessionIfAny(examId: string): void {
    const studentId = this.auth.currentUser().id;
    const activeSession = this.facade.getActiveSession(examId, studentId);
    if (activeSession) {
      this.router.navigate(['/exam-session', activeSession.token], { replaceUrl: true });
    }
  }

  startExam(): void {
    const exam = this.exam();
    if (!exam) return;

    const studentId = this.auth.currentUser().id;

    if (this.facade.hasActiveSession(exam.id, studentId)) {
      this.errorMessage.set(
        'Bu sınav için zaten aktif bir oturumunuz var. Aynı anda yalnızca bir oturum açabilirsiniz.'
      );
      return;
    }

    this.errorMessage.set(null);

    this.facade.startSession(exam.id, studentId, exam.rules.durationMinutes).subscribe({
      next: (session) => {
        this.router.navigate(['/exam-session', session.token], { replaceUrl: true });
      },
    });
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
  }

  onAnswerChange(questionId: string, value: string): void {
    const session = this.session();
    if (!session) {
      this.facade.setLocalAnswer(questionId, value);
      return;
    }

    const clientVersion = this.answerVersions()[questionId] ?? 0;

    if (this.facade.isOffline()) {
      // Bağlantı yokken cevabı kaybetmeden yerel kuyruğa al; bağlantı
      // gelince facade bunları sırayla otomatik senkronize edecek.
      this.facade.queueAnswerWhileOffline(questionId, value, clientVersion);
      return;
    }

    this.facade.setLocalAnswer(questionId, value);
    this.facade.saveDraft(session.id, questionId, value, clientVersion).subscribe();
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

    this.facade.submitSession(session.id).subscribe();
  }
}