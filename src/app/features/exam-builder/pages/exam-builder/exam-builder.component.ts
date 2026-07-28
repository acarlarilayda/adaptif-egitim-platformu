import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamRepository, ConstraintCoverage } from '../../data-access/exam.repository';
import { Exam } from '../../../../shared/models/exam.model';
import { ExamBlueprint } from '../../../../shared/models/exam-blueprint.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface BlueprintWithCoverage {
  blueprint: ExamBlueprint;
  coverages: ConstraintCoverage[];
  isFullySatisfied: boolean;
  exams: Exam[];
}

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './exam-builder.component.html',
  styleUrl: './exam-builder.component.scss',
})
export class ExamBuilderComponent implements OnInit {
  private readonly examRepository = inject(ExamRepository);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly blueprintRows = signal<BlueprintWithCoverage[]>([]);

  /** exam.id -> son işlemden kalan hata mesajı */
  readonly actionError = signal<Partial<Record<string, string>>>({});

  readonly examToPublish = signal<Exam | null>(null);
  readonly isConfirmDialogOpen = computed(() => this.examToPublish() !== null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.examRepository.getBlueprints().subscribe({
      next: (blueprints) => {
        this.examRepository.getExams().subscribe({
          next: (exams) => {
            const rows: BlueprintWithCoverage[] = blueprints.map((blueprint) => {
              const coverages = this.examRepository.getCoverageForBlueprint(blueprint);
              return {
                blueprint,
                coverages,
                isFullySatisfied: coverages.every((c) => c.isSatisfied),
                exams: exams.filter((e) => e.blueprintId === blueprint.id),
              };
            });
            this.blueprintRows.set(rows);
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
    const result = this.examRepository.publish(exam.id, userId);

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
    this.loadData();
  }
}