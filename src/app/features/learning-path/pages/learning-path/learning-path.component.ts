import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningPathRepository, PathStepWithContent } from '../../data-access/learning-path.repository';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.scss',
})
export class LearningPathComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly steps = signal<PathStepWithContent[]>([]);

  readonly contentTypeLabels: Record<string, string> = {
    video: 'Video',
    reading: 'Okuma',
    exercise: 'Alıştırma',
    simulation: 'Simülasyon',
  };

  constructor(
    private readonly pathRepository: LearningPathRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const studentId = this.auth.currentUser().id;

    this.pathRepository.getPathForStudent(studentId).subscribe({
      next: (steps) => {
        this.steps.set(steps);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}