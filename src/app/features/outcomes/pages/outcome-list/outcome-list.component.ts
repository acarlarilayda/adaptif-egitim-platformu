import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OutcomeRepository } from '../../data-access/outcome.repository';
import { Course } from '../../../../shared/models/course.model';
import { LearningOutcome } from '../../../../shared/models/learning-outcome.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/auth/role.enum';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface CourseWithOutcomes {
  course: Course;
  outcomes: LearningOutcome[];
}

@Component({
  selector: 'app-outcome-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './outcome-list.component.html',
  styleUrl: './outcome-list.component.scss',
})
export class OutcomeListComponent implements OnInit {
  private readonly outcomeRepository = inject(OutcomeRepository);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly groups = signal<CourseWithOutcomes[]>([]);

  /** outcome.id -> select'te seçili yeni önkoşul id'si */
  readonly selectedPrerequisite = signal<Partial<Record<string, string>>>({});
  /** outcome.id -> son işlemden kalan hata mesajı */
  readonly actionError = signal<Partial<Record<string, string>>>({});

  readonly outcomeToPublish = signal<LearningOutcome | null>(null);
  readonly isConfirmDialogOpen = computed(() => this.outcomeToPublish() !== null);

  /** Şimdilik yalnızca Program Yöneticisi kazanım haritasını yönetebilir. */
  readonly canManage = computed(() => this.authService.hasRole(Role.ProgramManager));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.outcomeRepository.getCourses().subscribe({
      next: (courses) => {
        this.outcomeRepository.getAllOutcomes().subscribe({
          next: (outcomes) => {
            const groups: CourseWithOutcomes[] = courses.map((course) => ({
              course,
              outcomes: outcomes.filter((o) => o.courseId === course.id),
            }));
            this.groups.set(groups);
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

  /** Aynı derste, henüz önkoşul olarak eklenmemiş, kendisi olmayan diğer kazanımlar. */
  availablePrerequisites(group: CourseWithOutcomes, outcome: LearningOutcome): LearningOutcome[] {
    return group.outcomes.filter(
      (candidate) => candidate.id !== outcome.id && !outcome.prerequisiteIds.includes(candidate.id)
    );
  }

  onSelectPrerequisite(outcomeId: string, prerequisiteId: string): void {
    this.selectedPrerequisite.update((current) => ({ ...current, [outcomeId]: prerequisiteId }));
  }

  addPrerequisite(outcome: LearningOutcome): void {
    const prerequisiteId = this.selectedPrerequisite()[outcome.id];
    if (!prerequisiteId) {
      return;
    }

    const result = this.outcomeRepository.addPrerequisite(outcome.id, prerequisiteId);

    if (!result.success) {
      const message =
        result.error === 'cycle'
          ? 'Bu önkoşul döngü oluşturacağı için eklenemedi.'
          : 'Kazanım bulunamadı.';
      this.actionError.update((current) => ({ ...current, [outcome.id]: message }));
      return;
    }

    this.actionError.update((current) => ({ ...current, [outcome.id]: '' }));
    this.loadData();
  }

  requestPublish(outcome: LearningOutcome): void {
    this.outcomeToPublish.set(outcome);
  }

  cancelPublish(): void {
    this.outcomeToPublish.set(null);
  }

  confirmPublish(): void {
    const outcome = this.outcomeToPublish();
    if (!outcome) {
      return;
    }

    const userId = this.authService.currentUser().id;
    const result = this.outcomeRepository.publish(outcome.id, userId);

    if (!result.success) {
      const message =
        result.error === 'unpublished_prerequisite'
          ? 'Önce bu kazanımın tüm önkoşulları yayınlanmalı.'
          : 'Kazanım bulunamadı.';
      this.actionError.update((current) => ({ ...current, [outcome.id]: message }));
      this.outcomeToPublish.set(null);
      return;
    }

    this.actionError.update((current) => ({ ...current, [outcome.id]: '' }));
    this.outcomeToPublish.set(null);
    this.loadData();
  }
}