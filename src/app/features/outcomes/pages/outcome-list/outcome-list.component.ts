import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { OutcomeFacade } from '../../data-access/outcome.facade';
import { LearningOutcome } from '../../../../shared/models/learning-outcome.model';
import { CourseWithOutcomes } from '../../models/outcome-view.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/auth/role.enum';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OutcomeGraphComponent } from '../../../../shared/components/outcome-graph/outcome-graph.component';

@Component({
  selector: 'app-outcome-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent, OutcomeGraphComponent],
  templateUrl: './outcome-list.component.html',
  styleUrl: './outcome-list.component.scss',
})
export class OutcomeListComponent implements OnInit {
  private readonly facade = inject(OutcomeFacade);
  private readonly authService = inject(AuthService);

  readonly isLoading = this.facade.isLoading;
  readonly hasError = this.facade.hasError;
  readonly groups = this.facade.groups;

  readonly actionError = signal<Partial<Record<string, string>>>({});

  /**
   * Her kazanımın önkoşul seçimi için ayrı bir Reactive Forms FormControl'ü,
   * outcomeId'ye göre lazy oluşturulup burada saklanır. Cross-field domain
   * validasyonu (İş Kuralı #1: döngü oluşturulamaz) `cycleValidator` ile
   * anlık olarak (submit beklemeden) forma gömülür.
   */
  private readonly prerequisiteControls = new Map<string, FormControl<string | null>>();

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

  /** Domain validasyonu: seçilen önkoşul, önkoşul grafiğinde döngü oluşturuyorsa formu geçersiz kılar. */
  private cycleValidator(outcomeId: string): ValidatorFn {
    return (control): ValidationErrors | null => {
      const prerequisiteId = control.value;
      if (!prerequisiteId) {
        return null;
      }
      return this.facade.wouldCreateCycle(outcomeId, prerequisiteId) ? { cycle: true } : null;
    };
  }

  /** Şablon, her kazanım satırı için bu metodu çağırarak ilgili FormControl'ü lazy alır. */
  prerequisiteControlFor(outcomeId: string): FormControl<string | null> {
    let control = this.prerequisiteControls.get(outcomeId);
    if (!control) {
      control = new FormControl<string | null>('', {
        validators: [this.cycleValidator(outcomeId)],
      });
      this.prerequisiteControls.set(outcomeId, control);
    }
    return control;
  }

  addPrerequisite(outcome: LearningOutcome): void {
    const control = this.prerequisiteControlFor(outcome.id);
    const prerequisiteId = control.value;

    if (!prerequisiteId || control.invalid) {
      if (control.hasError('cycle')) {
        this.actionError.update((current) => ({
          ...current,
          [outcome.id]: 'Bu önkoşul döngü oluşturacağı için eklenemedi.',
        }));
      }
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

    control.reset('');
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
