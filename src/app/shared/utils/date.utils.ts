/**
 * Bir ISO tarihini "3 dakika önce", "2 saat önce" gibi göreli bir
 * ifadeye çevirir. Audit log ve bildirim listelerinde kullanılır.
 */
export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(isoDate).getTime();
  const diffSeconds = Math.round(diffMs / 1000);

  if (diffSeconds < 60) {
    return 'az önce';
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} saat önce`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} gün önce`;
}