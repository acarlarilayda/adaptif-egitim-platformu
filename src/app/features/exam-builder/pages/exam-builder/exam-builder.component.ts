import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamFacade } from '../../data-access/exam.facade';
import { Exam } from '../../../../shared/models/exam.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './exam-builder.component.html',
  styleUrl: './exam-builder.component.scss',
})
export class ExamBuilderComponent implements OnInit {
  private readonly facade = inject(ExamFacade);
  private readonly authService = inject(AuthService);

  readonly isLoading = this.facade.isBuilderLoading;
  readonly hasError = this.facade.hasBuilderError;
  readonly blueprintRows = this.facade.blueprintRows;

  readonly actionError = signal<Partial<Record<string, string>>>({});

  readonly examToPublish = signal<Exam | null>(null);
  readonly isConfirmDialogOpen = computed(() => this.examToPublish() !== null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadBuilderData();
  }

  requestPublish(exam: Exam): void {
    this.examToPublish.set(exam);
  }

  cancelPublish(): void {
    this.examToPublish.set(null);
  }

  confirmPublish(): void {
    const exam = this.examToPublish();
    if (!exam) {
      return;
    }

    const userId = this.authService.currentUser().id;
    const result = this.facade.publish(exam.id, userId);

    if (!result.success) {
      const message =
        result.error === 'blueprint_not_satisfied'
          ? 'Blueprint hedefleri karşılanmadan bu sınav yayınlanamaz.'
          : result.error === 'already_published'
          ? 'Bu sınav zaten yayınlanmış.'
          : 'Sınav bulunamadı.';
      this.actionError.update((current) => ({ ...current, [exam.id]: message }));
      this.examToPublish.set(null);
      return;
    }

    this.actionError.update((current) => ({ ...current, [exam.id]: '' }));
    this.examToPublish.set(null);
  }
}