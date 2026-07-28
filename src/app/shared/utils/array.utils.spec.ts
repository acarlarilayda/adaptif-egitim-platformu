import { groupBy } from './array.utils';

describe('groupBy', () => {
  it('elemanları verilen anahtara göre gruplar', () => {
    const items = [
      { course: 'Matematik', title: 'A' },
      { course: 'Fizik', title: 'B' },
      { course: 'Matematik', title: 'C' },
    ];

    const grouped = groupBy(items, (item) => item.course);

    expect(grouped['Matematik'].length).toBe(2);
    expect(grouped['Fizik'].length).toBe(1);
  });

  it('boş dizi için boş nesne döner', () => {
    expect(groupBy([], (item: unknown) => String(item))).toEqual({});
  });
});