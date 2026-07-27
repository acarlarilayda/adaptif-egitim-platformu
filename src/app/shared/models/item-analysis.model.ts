export interface OptionAnalysis {
  optionId: string;
  selectionCount: number;
  selectionRate: number;
}

export interface ItemAnalysis {
  id: string;
  questionId: string;
  difficultyIndex: number;
  discriminationIndex: number;
  optionAnalyses: OptionAnalysis[];
  sampleSize: number;
  calculatedAt: string;
}