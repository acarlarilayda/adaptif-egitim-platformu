import { TestBed } from '@angular/core/testing';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(LocalStorageAdapter);
  });

  it('bir değeri kaydeder ve geri okur', () => {
    const saved = adapter.set('test-key', { foo: 'bar' });
    expect(saved).toBe(true);
    expect(adapter.get('test-key')).toEqual({ foo: 'bar' });
  });

  it("var olmayan bir anahtar için null döner", () => {
    expect(adapter.get('does-not-exist')).toBeNull();
  });

  it('remove() ile bir anahtarı siler', () => {
    adapter.set('to-remove', 123);
    adapter.remove('to-remove');
    expect(adapter.get('to-remove')).toBeNull();
  });

  it('anahtarları uygulamaya özgü önekle saklar', () => {
    adapter.set('my-key', 'value');
    expect(window.localStorage.getItem('aep:my-key')).toBe(JSON.stringify('value'));
  });
});