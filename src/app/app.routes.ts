import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './core/auth/role.enum';

export const routes: Routes = [
  { path: '', redirectTo: 'outcomes', pathMatch: 'full' },
  {
    path: 'outcomes',
    loadComponent: () =>
      import('./features/outcomes/pages/outcome-list/outcome-list.component').then(
        (m) => m.OutcomeListComponent
      ),
  },
  {
    path: 'outcomes/map',
    loadComponent: () =>
      import('./features/outcomes/pages/outcome-list/outcome-list.component').then(
        (m) => m.OutcomeListComponent
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/pages/course-list/course-list.component').then(
        (m) => m.CourseListComponent
      ),
  },
  {
    path: 'courses/:id/path',
    loadComponent: () =>
      import('./features/courses/pages/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent
      ),
  },
  {
    path: 'question-bank',
    loadComponent: () =>
      import('./features/question-bank/pages/question-list/question-list.component').then(
        (m) => m.QuestionListComponent
      ),
  },
  {
    path: 'questions/:id',
    loadComponent: () =>
      import('./features/question-bank/pages/question-detail/question-detail.component').then(
        (m) => m.QuestionDetailComponent
      ),
  },
  {
    path: 'exam-builder',
    loadComponent: () =>
      import('./features/exam-builder/pages/exam-builder/exam-builder.component').then(
        (m) => m.ExamBuilderComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./features/exam-builder/pages/exam-list/exam-list.component').then(
        (m) => m.ExamListComponent
      ),
  },
  {
    path: 'learning-path',
    loadComponent: () =>
      import('./features/learning-path/pages/learning-path/learning-path.component').then(
        (m) => m.LearningPathComponent
      ),
  },
  {
    path: 'learning/dashboard',
    loadComponent: () =>
      import('./features/learning-path/pages/learning-dashboard/learning-dashboard.component').then(
        (m) => m.LearningDashboardComponent
      ),
  },
  {
    path: 'grading',
    loadComponent: () =>
      import('./features/grading/pages/grading-list/grading-list.component').then(
        (m) => m.GradingListComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist])],
  },
  {
    path: 'grading/:attemptId',
    loadComponent: () =>
      import('./features/grading/pages/attempt-detail/attempt-detail.component').then(
        (m) => m.AttemptDetailComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist])],
  },
  {
    path: 'recommendations',
    loadComponent: () =>
      import('./features/recommendations/pages/recommendation-list/recommendation-list.component').then(
        (m) => m.RecommendationListComponent
      ),
  },
  {
    path: 'item-analysis',
    loadComponent: () =>
      import('./features/analytics/pages/item-analysis/item-analysis.component').then(
        (m) => m.ItemAnalysisComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'audit-log',
    loadComponent: () =>
      import('./features/analytics/pages/audit-log/audit-log.component').then(
        (m) => m.AuditLogComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'student/:id/analytics',
    loadComponent: () =>
      import('./features/analytics/pages/student-analytics/student-analytics.component').then(
        (m) => m.StudentAnalyticsComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'cohort-analytics',
    loadComponent: () =>
      import('./features/analytics/pages/cohort-analytics/cohort-analytics.component').then(
        (m) => m.CohortAnalyticsComponent
      ),
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'exam-session',
    loadComponent: () =>
      import('./features/exam-session/pages/exam-session/exam-session.component').then(
        (m) => m.ExamSessionComponent
      ),
  },
  {
    path: 'exam-session/:token',
    loadComponent: () =>
      import('./features/exam-session/pages/exam-session/exam-session.component').then(
        (m) => m.ExamSessionComponent
      ),
  },
];