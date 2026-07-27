import { Injectable, computed, signal } from '@angular/core';
import { Role } from './role.enum';
import { User } from './user.model';

// Demo kullanıcılar — her rol için bir tane, gerçek login akışı yok.
const DEMO_USERS: User[] = [
  {
    id: 'u-student-1',
    name: 'Ayşe Yıldız',
    email: 'ayse.yildiz@ornek.edu',
    role: Role.Student,
    courseIds: ['course-1', 'course-2'],
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'u-instructor-1',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@ornek.edu',
    role: Role.Instructor,
    courseIds: ['course-1'],
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'u-assessment-1',
    name: 'Elif Demir',
    email: 'elif.demir@ornek.edu',
    role: Role.AssessmentSpecialist,
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'u-program-1',
    name: 'Can Aydın',
    email: 'can.aydin@ornek.edu',
    role: Role.ProgramManager,
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'u-observer-1',
    name: 'Zeynep Şahin',
    email: 'zeynep.sahin@ornek.edu',
    role: Role.Observer,
    cohortIds: ['cohort-1'],
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'u-admin-1',
    name: 'Ozan Çelik',
    email: 'ozan.celik@ornek.edu',
    role: Role.PlatformAdmin,
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User>(DEMO_USERS[0]);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly currentRole = computed(() => this.currentUserSignal().role);
  readonly demoUsers = DEMO_USERS;

  switchUser(userId: string): void {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      this.currentUserSignal.set(found);
    }
  }

  hasRole(...roles: Role[]): boolean {
    return roles.includes(this.currentUserSignal().role);
  }
}