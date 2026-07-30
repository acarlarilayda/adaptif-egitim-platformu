import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamFacade } from '../../data-access/exam.facade';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  private readonly facade = inject(ExamFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = this.facade.isExamListLoading;
  readonly hasError = this.facade.hasExamListError;
  readonly exams = this.facade.exams;

  readonly searchTerm = signal('');
  readonly sortDirection = signal<SortDirection>('asc');

  readonly filteredExams = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const direction = this.sortDirection();

    let result = this.exams();

    if (term.length > 0) {
      result = result.filter((e) => e.title.toLowerCase().includes(term));
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
    this.facade.loadExamList();
  }
}