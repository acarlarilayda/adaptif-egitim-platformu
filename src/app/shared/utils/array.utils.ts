/**
 * Bir diziyi, verilen anahtar fonksiyonuna göre gruplara ayırır.
 * Örn: kazanımları derse göre, soruları zorluk seviyesine göre gruplamak için.
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}