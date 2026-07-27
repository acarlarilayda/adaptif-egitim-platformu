export interface MasteryScoreInput {
  recentAnswerCorrectCount: number;
  recentAnswerTotalCount: number;
  averageDifficulty: number;
  attemptCount: number;
}

export interface MasteryScore {
  id: string;
  studentId: string;
  outcomeId: string;
  score: number;
  inputs: MasteryScoreInput;
  calculatedAt: string;
}