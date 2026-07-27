export type ContentType = 'video' | 'reading' | 'exercise' | 'simulation';

export interface ContentAccessCondition {
  requiresOutcomeIds: string[];
  minimumMasteryScore?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  outcomeId: string;
  durationMinutes: number;
  accessCondition: ContentAccessCondition;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}