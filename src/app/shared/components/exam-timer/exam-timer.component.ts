import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

/**
 * Sunucu zaman senkronizasyonunu simüle eder: sayaç "kalan saniye"yi
 * her tick'te yeniden yazmak yerine, oturumun bittiği MUTLAK zaman
 * damgasından (endsAtEpochMs) geriye doğru hesaplar. Böylece:
 * - sekme arka plana alınıp interval throttle edilse bile (tekrar
 *   foreground olduğunda) doğru kalan süre hesaplanır,
 * - cihaz saati oynasa bile referans, dışarıdan verilen sunucu zaman
 *   farkı (serverTimeOffsetMs) ile düzeltilir.
 */
@Component({
  selector: 'app-exam-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-timer.component.html',
  styleUrl: './exam-timer.component.scss',
})
export class ExamTimerComponent implements OnChanges, OnDestroy {
  // Sayacın başlayacağı saniye değeri, dışarıdan verilir.
  @Input({ required: true }) initialSeconds = 0;

  // Sayaç çalışıp çalışmayacağını dışarıdan kontrol etmek için kullanılır.
  @Input() isRunning = true;

  /**
   * Sunucu ile istemci arasındaki zaman farkının simülasyonu (ms).
   * Gerçek sistemde bu değer bir "server time sync" çağrısından gelir.
   * Varsayılan 0: istemci saati sunucuyla senkron kabul edilir, ama
   * hesaplama yine de mutlak bitiş zamanına göre yapılır.
   */
  @Input() serverTimeOffsetMs = 0;

  // Süre dolduğunda üst component'e haber verir.
  @Output() timeUp = new EventEmitter<void>();

  readonly remainingSeconds = signal(0);

  readonly formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly isLowTime = computed(() => this.remainingSeconds() <= 60 && this.remainingSeconds() > 0);
  readonly isFinished = computed(() => this.remainingSeconds() <= 0);

  /** Sınavın biteceği MUTLAK zaman damgası (sunucu referanslı). */
  private endsAtEpochMs = 0;
  private subscription: Subscription | null = null;

  private now(): number {
    // "Sunucu referans zamanı" = istemci saati + simüle edilen ofset.
    return Date.now() + this.serverTimeOffsetMs;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSeconds']) {
      this.endsAtEpochMs = this.now() + this.initialSeconds * 1000;
      this.syncRemaining();
    }

    if (changes['isRunning']) {
      if (this.isRunning) {
        this.startTicking();
      } else {
        this.subscription?.unsubscribe();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /** Kalan saniyeyi, kaç tick geçtiğine bakmadan mutlak bitişten yeniden hesaplar. */
  private syncRemaining(): void {
    const remainingMs = this.endsAtEpochMs - this.now();
    this.remainingSeconds.set(Math.max(0, Math.ceil(remainingMs / 1000)));
  }

  private startTicking(): void {
    this.subscription?.unsubscribe();
    this.syncRemaining();
    this.subscription = interval(1000).subscribe(() => {
      this.syncRemaining();
      if (this.remainingSeconds() <= 0) {
        this.subscription?.unsubscribe();
        this.timeUp.emit();
      }
    });
  }
}
