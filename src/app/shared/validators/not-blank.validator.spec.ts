import { FormControl } from '@angular/forms';
import { notBlankValidator } from './not-blank.validator';

describe('notBlankValidator', () => {
  const validator = notBlankValidator();

  it('boş string için hata döner', () => {
    expect(validator(new FormControl(''))).toEqual({ notBlank: true });
  });

  it('sadece boşluklardan oluşan string için hata döner', () => {
    expect(validator(new FormControl('   '))).toEqual({ notBlank: true });
  });

  it('anlamlı bir metin için null döner', () => {
    expect(validator(new FormControl('Gerekçe metni'))).toBeNull();
  });

  it('null/undefined değer için null döner (required ile birlikte kullanılmalı)', () => {
    expect(validator(new FormControl(null))).toBeNull();
  });
});