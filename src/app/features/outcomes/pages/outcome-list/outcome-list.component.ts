import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutcomeRepository } from '../../data-access/outcome.repository';
import { Course } from '../../../../shared/models/course.model';
import { LearningOutcome } from '../../../../shared/models/learning-outcome.model';

interface CourseWithOutcomes {
  course: Course;
  outcomes: LearningOutcome[];
}

@Component({
  selector: 'app-outcome-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './outcome-list.component.html',
  styleUrl: './outcome-list.component.scss',
})
export class OutcomeListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly groups = signal<CourseWithOutcomes[]>([]);

  constructor(private readonly outcomeRepository: OutcomeRepository) {}

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
}