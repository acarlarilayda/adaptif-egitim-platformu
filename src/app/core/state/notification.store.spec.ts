import { TestBed } from '@angular/core/testing';
import { NotificationStore } from './notification.store';

describe('NotificationStore', () => {
  let store: NotificationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(NotificationStore);
  });

  it('bir bildirim gösterir', () => {
    store.show('Kaydedildi', 'success', 0);
    expect(store.notifications().length).toBe(1);
    expect(store.notifications()[0].message).toBe('Kaydedildi');
    expect(store.notifications()[0].severity).toBe('success');
  });

  it('dismiss() ile belirli bir bildirimi kaldırır', () => {
    const id = store.show('Hata oluştu', 'error', 0);
    store.dismiss(id);
    expect(store.notifications().length).toBe(0);
  });

  it('clear() tüm bildirimleri temizler', () => {
    store.show('Birinci', 'info', 0);
    store.show('İkinci', 'info', 0);
    store.clear();
    expect(store.notifications().length).toBe(0);
  });
});