import { Injectable } from '@angular/core';

/**
 * window.localStorage üzerine ince bir soyutlama katmanı.
 * - Anahtarları uygulamaya özgü bir önekle isimlendirir.
 * - localStorage kullanılamadığında (gizli sekme, kota dolu, SSR vb.)
 *   hata fırlatmak yerine sessizce başarısız olur; uygulama bellek içi
 *   state ile çalışmaya devam edebilir.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageAdapter {
  private readonly prefix = 'aep:';

  set<T>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(this.prefix + key);
    } catch {
      // yut
    }
  }
}