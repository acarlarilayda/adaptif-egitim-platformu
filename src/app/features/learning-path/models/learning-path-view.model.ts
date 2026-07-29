import { ContentItem } from '../../../shared/models/content-item.model';

export interface PathStepWithContent {
  contentItem: ContentItem;
  order: number;
  reason: string;
  isCompleted: boolean;
  isLocked: boolean;
}