import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamRepository, ConstraintCoverage } from '../../data-access/exam.repository';
import { ExamBlueprint } from '../../../../shared/models/exam-blueprint.model';

interface BlueprintWithCoverage {
  blueprint: ExamBlueprint;
  coverages: ConstraintCoverage[];
  isFullySatisfied: boolean;
}

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-builder.component.html',
  styleUrl: './exam-builder.component.scss',
})
export class ExamBuilderComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly blueprintRows = signal<BlueprintWithCoverage[]>([]);

  constructor(private readonly examRepository: ExamRepository) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.examRepository.getBlueprints().subscribe({
      next: (blueprints) => {
        const rows: BlueprintWithCoverage[] = blueprints.map((blueprint) => {
          const coverages = this.examRepository.getCoverageForBlueprint(blueprint);
          return {
            blueprint,
            coverages,
            isFullySatisfied: coverages.every((c) => c.isSatisfied),
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
  }
}