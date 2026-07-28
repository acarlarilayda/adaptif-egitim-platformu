import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Angular'ın yerleşik `Validators.required`'ı sadece boş string'i
 * yakalar; sadece boşluk karakterlerinden oluşan bir girdiyi (örn.
 * "   ") geçerli sayar. Gerekçe/açıklama gibi alanlar için bu yetersizdir.
 */
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null;
    }
    const isBlank = typeof value === 'string' && value.trim().length === 0;
    return isBlank ? { notBlank: true } : null;
  };
}