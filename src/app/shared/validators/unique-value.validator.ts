import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, of, delay } from 'rxjs';

/**
 * Örnek: bir blueprint/soru başlığının mevcut başlıklarla çakışıp
 * çakışmadığını "sunucuya sorar gibi" (simüle edilmiş gecikmeyle)
 * kontrol eden async validator fabrikası.
 */
export function uniqueValueValidator(
  existingValues: () => string[],
  currentValue?: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').trim().toLowerCase();

    if (!value || value === currentValue?.trim().toLowerCase()) {
      return of(null);
    }

    const isDuplicate = existingValues().some((v) => v.trim().toLowerCase() === value);

    return of(isDuplicate ? { notUnique: true } : null).pipe(delay(150));
  };
}