import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningPathFacade } from '../../data-access/learning-path.facade';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.scss',
})
export class LearningPathComponent implements OnInit {
  private readonly facade = inject(LearningPathFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isLoading;
  readonly hasError = this.facade.hasError;
  readonly steps = this.facade.steps;

  readonly contentTypeLabels: Record<string, string> = {
    video: 'Video',
    reading: 'Okuma',
    exercise: 'Alıştırma',
    simulation: 'Simülasyon',
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const studentId = this.auth.currentUser().id;
    this.facade.loadPathForStudent(studentId);
  }
}