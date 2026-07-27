import { delay, Observable, throwError } from 'rxjs';

/**
 * Gerçek bir HTTP isteğini simüle eder: rastgele gecikme ve
 * düşük ihtimalle hata fırlatma davranışı ekler.
 */
export interface MockTransportOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
  errorRate?: number; // 0 ile 1 arasında, örn. 0.1 = %10 ihtimalle hata
}

const DEFAULT_OPTIONS: Required<MockTransportOptions> = {
  minDelayMs: 300,
  maxDelayMs: 900,
  errorRate: 0,
};

export function mockRequest<T>(
  resultFactory: () => T,
  options: MockTransportOptions = {}
): Observable<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const randomDelay =
    opts.minDelayMs + Math.random() * (opts.maxDelayMs - opts.minDelayMs);

  const shouldFail = Math.random() < opts.errorRate;

  if (shouldFail) {
    return throwError(() => new Error('Sunucu isteği başarısız oldu (simüle edilmiş hata).')).pipe(
      delay(randomDelay)
    );
  }

  return new Observable<T>((subscriber) => {
    subscriber.next(resultFactory());
    subscriber.complete();
  }).pipe(delay(randomDelay));
}