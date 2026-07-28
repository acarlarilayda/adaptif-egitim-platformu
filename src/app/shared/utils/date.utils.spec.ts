import { timeAgo } from './date.utils';

describe('timeAgo', () => {
  const now = new Date('2026-01-01T12:00:00.000Z');

  it("bir dakikadan az süre için 'az önce' döner", () => {
    expect(timeAgo('2026-01-01T11:59:40.000Z', now)).toBe('az önce');
  });

  it('dakika cinsinden süreyi doğru hesaplar', () => {
    expect(timeAgo('2026-01-01T11:45:00.000Z', now)).toBe('15 dakika önce');
  });

  it('saat cinsinden süreyi doğru hesaplar', () => {
    expect(timeAgo('2026-01-01T09:00:00.000Z', now)).toBe('3 saat önce');
  });

  it('gün cinsinden süreyi doğru hesaplar', () => {
    expect(timeAgo('2025-12-30T12:00:00.000Z', now)).toBe('2 gün önce');
  });
});