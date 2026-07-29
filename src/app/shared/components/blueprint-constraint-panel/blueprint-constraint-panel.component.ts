import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionDifficulty, QuestionType } from '../../models/question.model';

/**
 * exam-builder feature'ındaki ConstraintCoverage ile yapısal olarak
 * (structural typing) uyumludur; shared bileşenler feature'lara bağımlı
 * olmamalıdır, bu yüzden burada kendi bağımsız view tipini tanımlıyoruz.
 */
export interface ConstraintCoverageView {
  constraint: {
    outcomeId: string;
    difficulty: QuestionDifficulty;
    questionType: QuestionType;
    requiredCount: number;
    requiredPoints: number;
  };
  matchedQuestions: { points: number }[];
  isSatisfied: boolean;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Çoktan Seçmeli',
  true_false: 'Doğru/Yanlış',
  short_answer: 'Kısa Cevap',
  essay: 'Açık Uçlu',
};

const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

/**
 * Bir blueprint'in her kısıtı için hedeflenen ve mevcut soru dağılımını
 * (soru sayısı ve toplanan puan) yan yana karşılaştırır, eksik kapsamayı
 * görsel olarak (ilerleme çubuğu + durum rozeti) vurgular.
 */
@Component({
  selector: 'app-blueprint-constraint-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blueprint-constraint-panel.component.html',
  styleUrl: './blueprint-constraint-panel.component.scss',
})
export class BlueprintConstraintPanelComponent {
  @Input({ required: true }) coverages: ConstraintCoverageView[] = [];
  /** outcomeId -> okunabilir kazanım başlığı. Verilmezse ham outcomeId gösterilir. */
  @Input() outcomeTitles: Record<string, string> = {};

  outcomeTitle(outcomeId: string): string {
    return this.outcomeTitles[outcomeId] ?? outcomeId;
  }

  typeLabel(type: QuestionType): string {
    return TYPE_LABELS[type];
  }

  difficultyLabel(difficulty: QuestionDifficulty): string {
    return DIFFICULTY_LABELS[difficulty];
  }

  countProgressPercent(coverage: ConstraintCoverageView): number {
    if (coverage.constraint.requiredCount === 0) {
      return 100;
    }
    return Math.min(
      100,
      Math.round((coverage.matchedQuestions.length / coverage.constraint.requiredCount) * 100)
    );
  }

  achievedPoints(coverage: ConstraintCoverageView): number {
    return coverage.matchedQuestions.reduce((sum, q) => sum + q.points, 0);
  }

  pointsProgressPercent(coverage: ConstraintCoverageView): number {
    if (coverage.constraint.requiredPoints === 0) {
      return 100;
    }
    return Math.min(100, Math.round((this.achievedPoints(coverage) / coverage.constraint.requiredPoints) * 100));
  }
}