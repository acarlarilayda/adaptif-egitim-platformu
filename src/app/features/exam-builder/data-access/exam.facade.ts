import { Injectable, inject } from '@angular/core';
import { ExamRepository } from './exam.repository';
import { ExamStore } from '../state/exam.store';
import { BlueprintWithCoverage, PublishExamResult } from '../models/exam-operations.model';

@Injectable({ providedIn: 'root' })
export class ExamFacade {
  private readonly repository = inject(ExamRepository);
  private readonly store = inject(ExamStore);

  readonly exams = this.store.exams;
  readonly isExamListLoading = this.store.isExamListLoading;
  readonly hasExamListError = this.store.hasExamListError;

  readonly blueprintRows = this.store.blueprintRows;
  readonly isBuilderLoading = this.store.isBuilderLoading;
  readonly hasBuilderError = this.store.hasBuilderError;

  loadExamList(): void {
    this.store.startExamListLoading();
    this.repository.getExams().subscribe({
      next: (exams) => this.store.setExams(exams),
      error: () => this.store.setExamListError(),
    });
  }

  loadBuilderData(): void {
    this.store.startBuilderLoading();
    this.repository.getBlueprints().subscribe({
      next: (blueprints) => {
        this.repository.getExams().subscribe({
          next: (exams) => {
            const rows: BlueprintWithCoverage[] = blueprints.map((blueprint) => {
              const coverages = this.repository.getCoverageForBlueprint(blueprint);
              return {
                blueprint,
                coverages,
                isFullySatisfied: coverages.every((c) => c.isSatisfied),
                exams: exams.filter((e) => e.blueprintId === blueprint.id),
              };
            });
            this.store.setBlueprintRows(rows);
          },
          error: () => this.store.setBuilderError(),
        });
      },
      error: () => this.store.setBuilderError(),
    });
  }

  publish(examId: string, userId: string): PublishExamResult {
    const result = this.repository.publish(examId, userId);
    if (result.success) {
      this.loadBuilderData();
    }
    return result;
  }
}