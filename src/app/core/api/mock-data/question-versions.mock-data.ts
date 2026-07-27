import { QuestionVersion } from '../../../shared/models/question-version.model';

export const MOCK_QUESTION_VERSIONS: QuestionVersion[] = [
  {
    id: 'qv-1',
    questionId: 'question-1',
    versionNumber: 1,
    type: 'multiple_choice',
    stem: '15 + 27 işleminin sonucu kaçtır?',
    options: [
      { id: 'opt-1', text: '32', isCorrect: false },
      { id: 'opt-2', text: '42', isCorrect: true },
      { id: 'opt-3', text: '52', isCorrect: false },
      { id: 'opt-4', text: '40', isCorrect: false },
    ],
    difficulty: 'easy',
    points: 10,
    changeNote: 'İlk yayın sürümü.',
    createdAt: '2025-09-03T10:00:00.000Z',
  },
  {
    id: 'qv-2',
    questionId: 'question-2',
    versionNumber: 1,
    type: 'true_false',
    stem: '-3/4 sayısı sayı doğrusunda 0’ın solunda yer alır.',
    options: [
      { id: 'opt-5', text: 'Doğru', isCorrect: true },
      { id: 'opt-6', text: 'Yanlış', isCorrect: false },
    ],
    difficulty: 'medium',
    points: 5,
    changeNote: 'İlk yayın sürümü.',
    createdAt: '2025-09-04T10:00:00.000Z',
  },
  {
    id: 'qv-3',
    questionId: 'question-3',
    versionNumber: 2,
    type: 'essay',
    stem: 'Bir cismin hızının zamana göre değişimini örnekle açıklayınız.',
    options: [],
    difficulty: 'hard',
    points: 20,
    changeNote: 'Soru kökü daha açık hale getirildi, puan 15’ten 20’ye çıkarıldı.',
    createdAt: '2025-09-12T10:00:00.000Z',
  },
];