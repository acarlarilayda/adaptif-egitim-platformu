import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRepository } from '../../data-access/analytics.repository';
import { ItemAnalysis } from '../../../../shared/models/item-analysis.model';

@Component({
  selector: 'app-item-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-analysis.component.html',
  styleUrl: './item-analysis.component.scss',
})
export class ItemAnalysisComponent implements OnInit {
  private readonly analyticsRepository = inject(AnalyticsRepository);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly itemAnalyses = signal<ItemAnalysis[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.analyticsRepository.getItemAnalyses().subscribe({
      next: (analyses) => {
        this.itemAnalyses.set(analyses);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}