import { ItemAnalysis } from '../../../shared/models/item-analysis.model';

export const MOCK_ITEM_ANALYSES: ItemAnalysis[] = [
  {
    id: 'item-analysis-1',
    questionId: 'question-1',
    difficultyIndex: 0.78,
    discriminationIndex: 0.45,
    optionAnalyses: [
      { optionId: 'opt-1', selectionCount: 4, selectionRate: 0.08 },
      { optionId: 'opt-2', selectionCount: 39, selectionRate: 0.78 },
      { optionId: 'opt-3', selectionCount: 5, selectionRate: 0.10 },
      { optionId: 'opt-4', selectionCount: 2, selectionRate: 0.04 },
    ],
    sampleSize: 50,
    calculatedAt: '2025-10-01T12:00:00.000Z',
  },
];