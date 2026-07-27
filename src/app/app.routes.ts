import { Routes } from '@angular/router';
import { OutcomeListComponent } from './features/outcomes/pages/outcome-list/outcome-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'outcomes', pathMatch: 'full' },
  { path: 'outcomes', component: OutcomeListComponent },
];