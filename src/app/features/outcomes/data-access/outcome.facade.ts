import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { OutcomeRepository } from './outcome.repository';
import { OutcomeStore } from '../state/outcome.store';
import { AddPrerequisiteResult, PublishOutcomeResult } from '../models/outcome-operations.model';

@Injectable({ providedIn: 'root' })
export class OutcomeFacade {
  private readonly repository = inject(OutcomeRepository);
  private readonly store = inject(OutcomeStore);

  readonly isLoading = this.store.isLoading;
  readonly hasError = this.store.hasError;
  readonly groups = this.store.groups;

  loadData(): void {
    this.store.startLoading();
    forkJoin({
      courses: this.repository.getCourses(),
      outcomes: this.repository.getAllOutcomes(),
    }).subscribe({
      next: ({ courses, outcomes }) => this.store.setData(courses, outcomes),
      error: () => this.store.setLoadError(),
    });
  }

  addPrerequisite(outcomeId: string, prerequisiteId: string): AddPrerequisiteResult {
    const result = this.repository.addPrerequisite(outcomeId, prerequisiteId);
    if (result.success) {
      this.loadData();
    }
    return result;
  }

  publish(outcomeId: string, userId: string): PublishOutcomeResult {
    const result = this.repository.publish(outcomeId, userId);
    if (result.success) {
      this.loadData();
    }
    return result;
  }
}
