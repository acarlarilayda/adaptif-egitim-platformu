import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MasteryHeatmapEntry {
  outcomeId: string;
  outcomeTitle: string;
  score: number;
  calculatedAt: string;
}

interface HeatmapRow {
  outcomeId: string;
  outcomeTitle: string;
  cells: (MasteryHeatmapEntry | null)[];
}

/**
 * Kazanım (satır) x zaman (sütun) ızgarasında ustalık skorlarını renk
 * yoğunluğuyla gösterir. Aynı kazanım için birden fazla zaman noktası
 * verilmezse tek sütunlu (yalnızca güncel durum) bir ızgara olarak
 * dereceden çalışmaya devam eder.
 */
@Component({
  selector: 'app-mastery-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mastery-heatmap.component.html',
  styleUrl: './mastery-heatmap.component.scss',
})
export class MasteryHeatmapComponent {
  @Input({ required: true }) set entries(value: MasteryHeatmapEntry[]) {
    this._entries.set(value ?? []);
  }
  get entries(): MasteryHeatmapEntry[] {
    return this._entries();
  }

  private readonly _entries = signal<MasteryHeatmapEntry[]>([]);

  readonly dates = computed(() => {
    const unique = new Set(this._entries().map((e) => e.calculatedAt));
    return [...unique].sort();
  });

  readonly rows = computed<HeatmapRow[]>(() => {
    const entries = this._entries();
    const dates = this.dates();

    const outcomeOrder = new Map<string, string>();
    for (const entry of entries) {
      if (!outcomeOrder.has(entry.outcomeId)) {
        outcomeOrder.set(entry.outcomeId, entry.outcomeTitle);
      }
    }

    return [...outcomeOrder.entries()].map(([outcomeId, outcomeTitle]) => ({
      outcomeId,
      outcomeTitle,
      cells: dates.map(
        (date) => entries.find((e) => e.outcomeId === outcomeId && e.calculatedAt === date) ?? null
      ),
    }));
  });

  dateLabel(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  }

  cellColor(entry: MasteryHeatmapEntry | null): string {
    if (!entry) {
      return 'transparent';
    }
    const hue = Math.max(0, Math.min(120, (entry.score / 100) * 120));
    return `hsl(${hue}, 65%, 45%)`;
  }

  cellTextColor(entry: MasteryHeatmapEntry | null): string {
    if (!entry) {
      return 'inherit';
    }
    return entry.score >= 35 && entry.score <= 85 ? '#ffffff' : '#1f2937';
  }
}