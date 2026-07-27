import { Routes } from '@angular/router';
import { OutcomeListComponent } from './features/outcomes/pages/outcome-list/outcome-list.component';
import { QuestionListComponent } from './features/question-bank/pages/question-list/question-list.component';
import { ExamBuilderComponent } from './features/exam-builder/pages/exam-builder/exam-builder.component';
import { LearningPathComponent } from './features/learning-path/pages/learning-path/learning-path.component';

export const routes: Routes = [
  { path: '', redirectTo: 'outcomes', pathMatch: 'full' },
  { path: 'outcomes', component: OutcomeListComponent },
  { path: 'question-bank', component: QuestionListComponent },
  { path: 'exam-builder', component: ExamBuilderComponent },
  { path: 'learning-path', component: LearningPathComponent },
];