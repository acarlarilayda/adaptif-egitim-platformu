import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OutcomeFacade } from '../../data-access/outcome.facade';
import { LearningOutcome } from '../../../../shared/models/learning-outcome.model';
import { CourseWithOutcomes } from '../../models/outcome-view.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/auth/role.enum';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-outcome-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './outcome-list.component.html',
  styleUrl: './outcome-list.component.scss',
})
export class OutcomeListComponent implements OnInit {
  private readonly facade = inject(OutcomeFacade);
  private readonly authService = inject(AuthService);

  readonly isLoading = this.facade.isLoading;
  readonly hasError = this.facade.hasError;
  readonly groups = this.facade.groups;

  readonly selectedPrerequisite = signal<Partial<Record<string, string>>>({});
  readonly actionError = signal<Partial<Record<string, string>>>({});

  readonly outcomeToPublish = signal<LearningOutcome | null>(null);
  readonly isConfirmDialogOpen = computed(() => this.outcomeToPublish() !== null);

  readonly canManage = computed(() => this.authService.hasRole(Role.ProgramManager));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadData();
  }

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

    const result = this.facade.addPrerequisite(outcome.id, prerequisiteId);

    if (!result.success) {
      const message =
        result.error === 'cycle'
          ? 'Bu önkoşul döngü oluşturacağı için eklenemedi.'
          : 'Kazanım bulunamadı.';
      this.actionError.update((current) => ({ ...current, [outcome.id]: message }));
      return;
    }

    this.actionError.update((current) => ({ ...current, [outcome.id]: '' }));
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
    const result = this.facade.publish(outcome.id, userId);

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
  }
}
