import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AutosaveStatus = 'synced' | 'pending' | 'conflict' | 'error';

@Component({
  selector: 'app-autosave-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autosave-indicator.component.html',
  styleUrl: './autosave-indicator.component.scss',
})
export class AutosaveIndicatorComponent {
  @Input({ required: true }) status!: AutosaveStatus;
}