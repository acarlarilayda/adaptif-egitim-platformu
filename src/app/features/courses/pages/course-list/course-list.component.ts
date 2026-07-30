import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseFacade } from '../../data-access/course.facade';
import { AuthService } from '../../../../core/auth/auth.service';
import { Role } from '../../../../core/auth/role.enum';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  private readonly facade = inject(CourseFacade);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = this.facade.isLoading;
  readonly hasError = this.facade.hasError;
  readonly courses = this.facade.courses;

  readonly canManage = computed(() => this.auth.hasRole(Role.ProgramManager));

  readonly searchTerm = signal('');
  readonly sortDirection = signal<SortDirection>('asc');

  readonly isCreateFormOpen = signal(false);
  readonly createError = signal<string | null>(null);

  /** Yeni ders oluşturma formu — Reactive Forms, domain validasyonu (başlık zorunlu). */
  readonly createForm = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    term: this.fb.control('2025-2026 Güz', { validators: [Validators.required] }),
  });

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
    this.facade.loadCourses();
  }

  toggleCreateForm(): void {
    this.isCreateFormOpen.update((open) => !open);
    this.createError.set(null);
  }

  submitCreateForm(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { title, term } = this.createForm.getRawValue();
    const result = this.facade.createCourse(title ?? '', term ?? '');

    if (!result.success) {
      this.createError.set('Ders başlığı boş olamaz.');
      return;
    }

    this.createForm.reset({ title: '', term: '2025-2026 Güz' });
    this.isCreateFormOpen.set(false);
    this.createError.set(null);
  }

  publish(courseId: string): void {
    const result = this.facade.publish(courseId, this.auth.currentUser().id);
    if (!result.success) {
      const message =
        result.error === 'no_outcomes'
          ? 'Bu derse önce en az bir kazanım eklenmeli.'
          : result.error === 'unauthorized'
          ? 'Bu işlem için yetkiniz yok.'
          : result.error === 'already_published'
          ? 'Bu ders zaten yayınlanmış.'
          : 'Ders bulunamadı.';
      this.createError.set(message);
    }
  }
}