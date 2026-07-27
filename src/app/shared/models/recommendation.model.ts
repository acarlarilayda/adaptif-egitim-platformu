export type RecommendationTargetType = 'content_item' | 'question';

export interface Recommendation {
  id: string;
  studentId: string;
  targetType: RecommendationTargetType;
  targetId: string;
  outcomeId: string;
  reason: string;
  masteryScoreAtTime: number;
  createdAt: string;
  isDismissed: boolean;
}