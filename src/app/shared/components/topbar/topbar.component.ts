import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_LABELS } from '../../../core/auth/role.enum';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  readonly roleLabels = ROLE_LABELS;

  constructor(public auth: AuthService) {}

  onUserChange(userId: string): void {
    this.auth.switchUser(userId);
  }
}