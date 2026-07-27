import { Routes } from '@angular/router';
import { OutcomeListComponent } from './features/outcomes/pages/outcome-list/outcome-list.component';
import { QuestionListComponent } from './features/question-bank/pages/question-list/question-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'outcomes', pathMatch: 'full' },
  { path: 'outcomes', component: OutcomeListComponent },
  { path: 'question-bank', component: QuestionListComponent },
];