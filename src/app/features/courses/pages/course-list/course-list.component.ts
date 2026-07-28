import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OutcomeRepository } from '../../../outcomes/data-access/outcome.repository';
import { Course } from '../../../../shared/models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  private readonly outcomeRepository = inject(OutcomeRepository);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.outcomeRepository.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}