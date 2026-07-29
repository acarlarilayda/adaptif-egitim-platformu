import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsFacade } from '../../data-access/analytics.facade';
import { AuthService } from '../../../../core/auth/auth.service';
import { MasteryHeatmapComponent } from '../../../../shared/components/mastery-heatmap/mastery-heatmap.component';

@Component({
  selector: 'app-student-analytics',
  standalone: true,
  imports: [CommonModule, MasteryHeatmapComponent],
  templateUrl: './student-analytics.component.html',
  styleUrl: './student-analytics.component.scss',
})
export class StudentAnalyticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(AnalyticsFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isStudentLoading;
  readonly hasError = this.facade.hasStudentError;
  readonly masteryScores = this.facade.studentMasteryScores;

  readonly isHistoryLoading = this.facade.isHistoryLoading;
  readonly masteryHistory = this.facade.masteryHistory;

  readonly studentName = signal<string>('');

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id') ?? '';

    const student = this.auth.demoUsers.find((u) => u.id === studentId);
    this.studentName.set(student?.name ?? studentId);

    this.facade.loadStudentMastery(studentId);
    this.facade.loadMasteryHistory(studentId);
  }
}