import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * recommendations feature'ındaki RecommendationView ile yapısal olarak
 * uyumludur; shared bileşenler feature'lara bağımlı olmamalıdır, bu
 * yüzden kendi bağımsız view tipimizi tanımlıyoruz.
 */
export interface RecommendationCardView {
  recommendation: {
    id: string;
    targetType: 'content_item' | 'question';
    outcomeId: string;
    reason: string;
    masteryScoreAtTime: number;
    createdAt: string;
  };
  outcomeTitle: string;
}

const LOW_MASTERY_THRESHOLD = 50;

/**
 * Bir adaptif önerinin girdilerini (hedef türü, kazanım, karar anındaki
 * ustalık skoru) ve karar gerekçesini (eşik mantığı + serbest metin
 * açıklama) birlikte açıklayan kart.
 */
@Component({
  selector: 'app-recommendation-reason-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-reason-card.component.html',
  styleUrl: './recommendation-reason-card.component.scss',
})
export class RecommendationReasonCardComponent {
  @Input({ required: true }) view!: RecommendationCardView;
  @Output() dismissed = new EventEmitter<string>();

  get isLowMastery(): boolean {
    return this.view.recommendation.masteryScoreAtTime < LOW_MASTERY_THRESHOLD;
  }

  get targetTypeLabel(): string {
    return this.view.recommendation.targetType === 'content_item' ? 'İçerik Önerisi' : 'Soru Önerisi';
  }

  get decisionSummary(): string {
    return this.isLowMastery
      ? `Ustalık skoru eşik değerin (${LOW_MASTERY_THRESHOLD}) altında olduğu için tekrar/telafi önerisi oluşturuldu.`
      : `Ustalık skoru eşik değerin (${LOW_MASTERY_THRESHOLD}) üzerinde olduğu için pekiştirme/ileri seviye önerisi oluşturuldu.`;
  }

  get scoreColor(): string {
    const score = this.view.recommendation.masteryScoreAtTime;
    const hue = Math.max(0, Math.min(120, (score / 100) * 120));
    return `hsl(${hue}, 65%, 45%)`;
  }

  dismiss(): void {
    this.dismissed.emit(this.view.recommendation.id);
  }
}