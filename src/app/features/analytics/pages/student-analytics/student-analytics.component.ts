import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsRepository, StudentMasteryView } from '../../data-access/analytics.repository';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-student-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-analytics.component.html',
  styleUrl: './student-analytics.component.scss',
})
export class StudentAnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly analyticsRepository = inject(AnalyticsRepository);
  private readonly auth = inject(AuthService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly masteryScores = signal<StudentMasteryView[]>([]);
  readonly studentName = signal<string>('');

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (!studentId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    const student = this.auth.demoUsers.find((u) => u.id === studentId);
    this.studentName.set(student?.name ?? studentId);

    this.analyticsRepository.getMasteryScoresForStudent(studentId).subscribe({
      next: (scores) => {
        this.masteryScores.set(scores);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}