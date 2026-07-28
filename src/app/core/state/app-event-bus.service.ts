import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

export interface AppEvent<T = unknown> {
  type: string;
  payload: T;
}

/**
 * Özellikler (feature) arası, birbirine doğrudan bağımlı olmadan
 * haberleşebilmesi için basit bir yayın/abone (pub-sub) event bus.
 * Örnek: bir kazanım yayınlandığında Analitik modülü bunu dinleyip
 * önbelleğini tazeleyebilir, aralarında doğrudan bir bağımlılık olmadan.
 */
@Injectable({ providedIn: 'root' })
export class AppEventBusService {
  private readonly events$ = new Subject<AppEvent>();

  emit<T>(type: string, payload: T): void {
    this.events$.next({ type, payload });
  }

  on<T>(type: string): Observable<T> {
    return this.events$.pipe(
      filter((event): event is AppEvent<T> => event.type === type),
      map((event) => event.payload)
    );
  }
}