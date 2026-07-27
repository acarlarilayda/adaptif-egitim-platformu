import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRepository } from '../../data-access/analytics.repository';
import { ItemAnalysis } from '../../../../shared/models/item-analysis.model';
import { AuditEvent } from '../../../../shared/models/audit-event.model';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly itemAnalyses = signal<ItemAnalysis[]>([]);
  readonly auditEvents = signal<AuditEvent[]>([]);

  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.analyticsRepository.getItemAnalyses().subscribe({
      next: (analyses) => {
        this.itemAnalyses.set(analyses);

        this.analyticsRepository.getAuditEvents().subscribe({
          next: (events) => {
            this.auditEvents.set(events);
            this.isLoading.set(false);
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}