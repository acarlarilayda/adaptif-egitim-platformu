import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { LearningPath } from '../../../shared/models/learning-path.model';
import { ContentItem } from '../../../shared/models/content-item.model';
import { MOCK_LEARNING_PATHS } from '../../../core/api/mock-data/learning-paths.mock-data';
import { MOCK_CONTENT_ITEMS } from '../../../core/api/mock-data/content-items.mock-data';
import { PathStepWithContent } from '../models/learning-path-view.model';

@Injectable({ providedIn: 'root' })
export class LearningPathRepository {
  private paths: LearningPath[] = [...MOCK_LEARNING_PATHS];
  private contentItems: ContentItem[] = [...MOCK_CONTENT_ITEMS];

  getPathForStudent(studentId: string): Observable<PathStepWithContent[]> {
    return mockRequest(() => {
      const path = this.paths.find((p) => p.studentId === studentId);
      if (!path) {
        return [];
      }

      return path.steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((step) => {
          const contentItem = this.contentItems.find(
            (c) => c.id === step.contentItemId
          )!;
          return {
            contentItem,
            order: step.order,
            reason: step.reason,
            isCompleted: step.isCompleted,
            isLocked: step.isLocked,
          };
        });
    });
  }
}