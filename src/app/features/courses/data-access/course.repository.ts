import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Course } from '../../../shared/models/course.model';
import { MOCK_COURSES } from '../../../core/api/mock-data/courses.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/auth/role.enum';
import { CreateCourseResult, PublishCourseResult } from '../models/course-operations.model';

@Injectable({ providedIn: 'root' })
export class CourseRepository {
  private readonly auditLog = inject(AuditLogService);
  private readonly auth = inject(AuthService);

  private courses: Course[] = [...MOCK_COURSES];

  getCourses(): Observable<Course[]> {
    return mockRequest(() => [...this.courses], { errorRate: 0.02 });
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return mockRequest(() => this.courses.find((c) => c.id === id), { errorRate: 0.02 });
  }

  /**
   * Program Yöneticisi rolü ders (program) oluşturabilir/yönetebilir
   * (Bölüm 3: "Program Yöneticisi: Kazanım haritası, program... yönetir.").
   */
  createCourse(title: string, term: string): CreateCourseResult {
    const currentRole = this.auth.currentRole();
    if (!title || title.trim().length === 0) {
      return { success: false, error: 'title_required' };
    }

    const newCourse: Course = {
      id: `course-${crypto.randomUUID()}`,
      title: title.trim(),
      term,
      instructorId: this.auth.currentUser().id,
      publishStatus: 'draft',
      outcomeIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    this.courses = [...this.courses, newCourse];

    this.auditLog.record({
      type: 'publish',
      userId: this.auth.currentUser().id,
      targetRecordId: newCourse.id,
      targetRecordType: 'Course',
      previousValue: '—',
      newValue: 'draft',
      reason: `"${newCourse.title}" dersi oluşturuldu.`,
    });

    return { success: true, course: newCourse };
  }

  /** Yalnızca Program Yöneticisi bir dersi yayına alabilir. */
  publish(courseId: string, userId: string): PublishCourseResult {
    const currentRole = this.auth.currentRole();
    if (currentRole !== Role.ProgramManager) {
      return { success: false, error: 'unauthorized' };
    }

    const course = this.courses.find((c) => c.id === courseId);
    if (!course) {
      return { success: false, error: 'not_found' };
    }

    if (course.publishStatus === 'published') {
      return { success: false, error: 'already_published' };
    }

    if (course.outcomeIds.length === 0) {
      return { success: false, error: 'no_outcomes' };
    }

    const previousValue = course.publishStatus;

    this.courses = this.courses.map((c) =>
      c.id === courseId
        ? { ...c, publishStatus: 'published' as const, updatedAt: new Date().toISOString(), version: c.version + 1 }
        : c
    );

    this.auditLog.record({
      type: 'publish',
      userId,
      targetRecordId: course.id,
      targetRecordType: 'Course',
      previousValue,
      newValue: 'published',
      reason: `"${course.title}" dersi yayına alındı.`,
    });

    return { success: true };
  }
}