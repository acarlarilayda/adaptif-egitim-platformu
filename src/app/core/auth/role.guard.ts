import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './role.enum';

/**
 * Belirli rollere sahip kullanıcıların erişimine izin veren bir route guard
 * üretir. İzin verilmeyen bir rol denenirse, kullanıcı kazanım haritası
 * sayfasına yönlendirilir.
 */
export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    router.navigate(['/outcomes']);
    return false;
  };
}