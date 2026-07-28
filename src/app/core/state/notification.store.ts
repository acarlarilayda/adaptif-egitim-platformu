import { Injectable, computed, signal } from '@angular/core';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  message: string;
  createdAt: number;
}

/**
 * Uygulama genelinde tek bildirim (toast) kaynağı.
 * Herhangi bir servis veya component, kullanıcıya kısa ömürlü bir
 * geri bildirim göstermek için `show()` çağırabilir.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  readonly notifications = computed(() => this.notificationsSignal());

  show(message: string, severity: NotificationSeverity = 'info', durationMs = 4000): string {
    const notification: AppNotification = {
      id: `notif-${crypto.randomUUID()}`,
      severity,
      message,
      createdAt: Date.now(),
    };

    this.notificationsSignal.update((current) => [...current, notification]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(notification.id), durationMs);
    }

    return notification.id;
  }

  dismiss(id: string): void {
    this.notificationsSignal.update((current) => current.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notificationsSignal.set([]);
  }
}