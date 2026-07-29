import { Recommendation } from '../../../shared/models/recommendation.model';

export interface RecommendationView {
  recommendation: Recommendation;
  outcomeTitle: string;
}