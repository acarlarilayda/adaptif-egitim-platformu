import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OutcomeFacade } from '../../../outcomes/data-access/outcome.facade';
import { Course } from '../../../../shared/models/course.model';

type SortDirection = 'asc' | 'desc';

@Component({
selector: 'app-course-list',
standalone: true,
imports: [CommonModule, RouterLink, FormsModule],
templateUrl: './course-list.component.html',
styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  private readonly outcomeFacade = inject(OutcomeFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly courses = signal<Course[]>([]);

  readonly searchTerm = signal('');
  readonly sortDirection = signal<SortDirection>('asc');

  /** Arama + sıralamayı uygulayarak filtrelenmiş listeyi döner (server-side davranışı taklit eder). */
  readonly filteredCourses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const direction = this.sortDirection();

    let result = this.courses();

    if (term.length > 0) {
      result = result.filter((c) => c.title.toLowerCase().includes(term));
    }

    result = [...result].sort((a, b) =>
      direction === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );

    return result;
  });

  ngOnInit(): void {
    const urlSearch = this.route.snapshot.queryParamMap.get('q');
    if (urlSearch) {
      this.searchTerm.set(urlSearch);
    }
    this.loadData();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: term || null },
      queryParamsHandling: 'merge',
    });
  }

  toggleSort(): void {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.outcomeFacade.getCourses().subscribe({
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