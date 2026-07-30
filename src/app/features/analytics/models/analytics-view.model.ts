export interface StudentMasteryView {
  outcomeId: string;
  outcomeTitle: string;
  score: number;
  calculatedAt: string;
}

export interface CohortOutcomeMastery {
  outcomeId: string;
  outcomeTitle: string;
  averageScore: number;
  studentCount: number;
  belowThresholdCount: number;
  /** Grup, gizlilik eşiğinin altındaysa bireysel/kesin veriler UI'da gösterilmemelidir. */
  isBelowPrivacyThreshold: boolean;
}