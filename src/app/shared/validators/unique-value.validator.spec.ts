import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { uniqueValueValidator } from './unique-value.validator';

type ValidatorResult = { notUnique: boolean } | null;

describe('uniqueValueValidator', () => {
  it('mevcut değerlerden biriyle eşleşirse notUnique hatası döner', (done) => {
    const validator = uniqueValueValidator(() => ['Matematik Sınavı', 'Fizik Sınavı']);
    const result$ = validator(new FormControl('matematik sınavı')) as Observable<ValidatorResult>;

    result$.subscribe((result) => {
      expect(result).toEqual({ notUnique: true });
      done();
    });
  });

  it('benzersiz bir değer için null döner', (done) => {
    const validator = uniqueValueValidator(() => ['Matematik Sınavı']);
    const result$ = validator(new FormControl('Kimya Sınavı')) as Observable<ValidatorResult>;

    result$.subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it("düzenleme modunda mevcut değerin kendisiyle çakışma saymaz", (done) => {
    const validator = uniqueValueValidator(() => ['Matematik Sınavı'], 'Matematik Sınavı');
    const result$ = validator(new FormControl('Matematik Sınavı')) as Observable<ValidatorResult>;

    result$.subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });
});