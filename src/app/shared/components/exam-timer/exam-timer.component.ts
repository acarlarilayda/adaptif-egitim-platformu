import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

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

  private subscription: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSeconds']) {
      this.remainingSeconds.set(this.initialSeconds);
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

  private startTicking(): void {
    this.subscription?.unsubscribe();
    this.subscription = interval(1000).subscribe(() => {
      const current = this.remainingSeconds();
      if (current <= 0) {
        this.subscription?.unsubscribe();
        this.timeUp.emit();
        return;
      }
      this.remainingSeconds.set(current - 1);
    });
  }
}