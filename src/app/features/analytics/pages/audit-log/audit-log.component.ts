import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuditLogService } from '../../../../core/observability/audit-log.service';
import { AuditEvent } from '../../../../shared/models/audit-event.model';
import { VirtualScrollListComponent } from '../../../../shared/components/virtual-scroll-list/virtual-scroll-list.component';

const MAX_LIVE_FEED_ITEMS = 20;

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, VirtualScrollListComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
})
export class AuditLogComponent implements OnDestroy {
  private readonly auditLog = inject(AuditLogService);
  private liveSubscription: Subscription | null = null;

  readonly events = computed(() => this.auditLog.events());

  /** Md.8 gerçek zamanlı akış: bağlıyken yeni audit kayıtları anlık olarak burada birikir. */
  readonly isLiveConnected = signal(false);
  readonly liveFeed = signal<AuditEvent[]>([]);

  toggleLiveConnection(): void {
    if (this.isLiveConnected()) {
      this.disconnect();
      return;
    }
    this.connect();
  }

  private connect(): void {
    this.liveSubscription = this.auditLog.eventStream$.subscribe((event) => {
      this.liveFeed.update((current) => [event, ...current].slice(0, MAX_LIVE_FEED_ITEMS));
    });
    this.isLiveConnected.set(true);
  }

  private disconnect(): void {
    this.liveSubscription?.unsubscribe();
    this.liveSubscription = null;
    this.isLiveConnected.set(false);
  }

  /**
   * Demo amaçlı: gerçek akışın (eventStream$) çalıştığını göstermek için
   * "başka bir yerde" olmuş gibi bir olay simüle eder. Gerçek uygulamada
   * bu olaylar zaten publish/puanlama/oturum akışlarından otomatik gelir;
   * bu buton sadece canlı akışı hemen görebilmek içindir.
   */
  simulateIncomingEvent(): void {
    this.auditLog.record({
      type: 'override',
      userId: 'system-demo',
      targetRecordId: `demo-${Date.now()}`,
      targetRecordType: 'CanlıAkışDemo',
      previousValue: '—',
      newValue: '—',
      reason: 'Canlı akışı göstermek için simüle edilmiş demo olayı.',
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}