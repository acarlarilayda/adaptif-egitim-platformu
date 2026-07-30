import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/auth/role.enum';

/**
 * *appHasPermission="[Role.Instructor, Role.ProgramManager]"
 * Sadece butonu gizlemekle kalmaz; şablon içeriğini DOM'a hiç basmaz,
 * böylece yetkisiz kullanıcı için işlem tetiklenemez hale gelir.
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private roles: Role[] = [];
  private hasView = false;

  @Input() set appHasPermission(roles: Role[]) {
    this.roles = roles ?? [];
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.auth.currentRole();
      this.updateView();
    });
  }

  private updateView(): void {
    const allowed = this.roles.length === 0 || this.auth.hasRole(...this.roles);

    if (allowed && !this.hasView) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainerRef.clear();
      this.hasView = false;
    }
  }
}