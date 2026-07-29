import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFacade } from '../../data-access/analytics.facade';

@Component({
  selector: 'app-item-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-analysis.component.html',
  styleUrl: './item-analysis.component.scss',
})
export class ItemAnalysisComponent implements OnInit {
  private readonly facade = inject(AnalyticsFacade);

  readonly isLoading = this.facade.isItemAnalysisLoading;
  readonly hasError = this.facade.hasItemAnalysisError;
  readonly itemAnalyses = this.facade.itemAnalyses;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadItemAnalyses();
  }
}