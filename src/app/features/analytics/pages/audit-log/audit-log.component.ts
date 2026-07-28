import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../../../core/observability/audit-log.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
})
export class AuditLogComponent {
  private readonly auditLog = inject(AuditLogService);

  readonly events = computed(() => this.auditLog.events());
}