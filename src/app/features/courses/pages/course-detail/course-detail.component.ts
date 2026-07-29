import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OutcomeFacade } from '../../../outcomes/data-access/outcome.facade';
import { Course } from '../../../../shared/models/course.model';
import { LearningOutcome } from '../../../../shared/models/learning-outcome.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly outcomeFacade = inject(OutcomeFacade);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly course = signal<Course | null>(null);
  readonly outcomes = signal<LearningOutcome[]>([]);

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.outcomeFacade.getCourses().subscribe({
      next: (courses) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          this.hasError.set(true);
          this.isLoading.set(false);
          return;
        }
        this.course.set(course);

        this.outcomeFacade.getOutcomesByCourse(courseId).subscribe({
          next: (outcomes) => {
            this.outcomes.set(
              [...outcomes].sort((a, b) => a.level - b.level)
            );
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