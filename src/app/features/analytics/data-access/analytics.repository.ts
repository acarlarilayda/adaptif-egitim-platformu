import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { ItemAnalysis } from '../../../shared/models/item-analysis.model';
import { MOCK_ITEM_ANALYSES } from '../../../core/api/mock-data/item-analyses.mock-data';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository {
  private itemAnalyses: ItemAnalysis[] = [...MOCK_ITEM_ANALYSES];

  getItemAnalyses(): Observable<ItemAnalysis[]> {
    return mockRequest(() => [...this.itemAnalyses]);
  }
}