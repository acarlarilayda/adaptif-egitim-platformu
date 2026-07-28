import { Routes } from '@angular/router';
import { OutcomeListComponent } from './features/outcomes/pages/outcome-list/outcome-list.component';
import { QuestionListComponent } from './features/question-bank/pages/question-list/question-list.component';
import { ExamBuilderComponent } from './features/exam-builder/pages/exam-builder/exam-builder.component';
import { LearningPathComponent } from './features/learning-path/pages/learning-path/learning-path.component';
import { GradingListComponent } from './features/grading/pages/grading-list/grading-list.component';
import { RecommendationListComponent } from './features/recommendations/pages/recommendation-list/recommendation-list.component';
import { ItemAnalysisComponent } from './features/analytics/pages/item-analysis/item-analysis.component';
import { AuditLogComponent } from './features/analytics/pages/audit-log/audit-log.component';
import { ExamSessionComponent } from './features/exam-session/pages/exam-session/exam-session.component';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './core/auth/role.enum';
import { StudentAnalyticsComponent } from './features/analytics/pages/student-analytics/student-analytics.component';
import { CohortAnalyticsComponent } from './features/analytics/pages/cohort-analytics/cohort-analytics.component';

export const routes: Routes = [
  { path: '', redirectTo: 'outcomes', pathMatch: 'full' },
  { path: 'outcomes', component: OutcomeListComponent },
  { path: 'question-bank', component: QuestionListComponent },
  {
    path: 'exam-builder',
    component: ExamBuilderComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  { path: 'learning-path', component: LearningPathComponent },
  {
    path: 'grading',
    component: GradingListComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist])],
  },
  { path: 'recommendations', component: RecommendationListComponent },
  {
    path: 'item-analysis',
    component: ItemAnalysisComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'audit-log',
    component: AuditLogComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'student/:id/analytics',
    component: StudentAnalyticsComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  {
    path: 'cohort-analytics',
    component: CohortAnalyticsComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  { path: 'exam-session', component: ExamSessionComponent },
  { path: 'exam-session/:token', component: ExamSessionComponent },
];