import { Routes } from '@angular/router';
import { OutcomeListComponent } from './features/outcomes/pages/outcome-list/outcome-list.component';
import { QuestionListComponent } from './features/question-bank/pages/question-list/question-list.component';
import { ExamBuilderComponent } from './features/exam-builder/pages/exam-builder/exam-builder.component';
import { LearningPathComponent } from './features/learning-path/pages/learning-path/learning-path.component';
import { GradingListComponent } from './features/grading/pages/grading-list/grading-list.component';
import { RecommendationListComponent } from './features/recommendations/pages/recommendation-list/recommendation-list.component';
import { AnalyticsDashboardComponent } from './features/analytics/pages/analytics-dashboard/analytics-dashboard.component';
import { ExamSessionComponent } from './features/exam-session/pages/exam-session/exam-session.component';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './core/auth/role.enum';

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
    path: 'analytics',
    component: AnalyticsDashboardComponent,
    canActivate: [roleGuard([Role.Instructor, Role.AssessmentSpecialist, Role.ProgramManager])],
  },
  { path: 'exam-session', component: ExamSessionComponent },
  { path: 'exam-session/:token', component: ExamSessionComponent },
];