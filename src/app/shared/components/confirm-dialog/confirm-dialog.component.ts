import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

let dialogIdCounter = 0;

/**
 * Md.8 erişilebilirlik gereksinimi: klavye kullanımı, focus yönetimi ve
 * uygun aria etiketleri. Bu bileşen uygulamadaki tüm onay diyaloglarının
 * (yayınlama, gönderme vb.) ortak noktası olduğu için buradaki düzeltme
 * her kullanan sayfaya otomatik yansır.
 *
 * - role="alertdialog" + aria-modal + aria-labelledby/describedby
 * - açılınca odak "Vazgeç" butonuna gider (en az yıkıcı eylem varsayılan)
 * - Tab/Shift+Tab diyalog içinde döngü yapar (basit focus trap)
 * - Escape ile kapanır
 * - kapanınca odak, diyaloğu açan öğeye geri döner
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Emin misiniz?';
  @Input() message = 'Bu işlem geri alınamaz.';
  @Input() confirmLabel = 'Onayla';
  @Input() cancelLabel = 'Vazgeç';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogBox') private dialogBoxRef?: ElementRef<HTMLElement>;
  @ViewChild('cancelButton') private cancelButtonRef?: ElementRef<HTMLButtonElement>;

  readonly titleId = `confirm-dialog-title-${++dialogIdCounter}`;
  readonly messageId = `confirm-dialog-message-${dialogIdCounter}`;

  private lastFocusedElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']) {
      return;
    }

    if (this.isOpen) {
      this.lastFocusedElement = document.activeElement as HTMLElement;
      // Diyalog bu change detection turunda henüz DOM'a girmemiş olabilir.
      setTimeout(() => this.cancelButtonRef?.nativeElement.focus());
    } else if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isOpen) {
      this.onCancel();
    }
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTabPressed(event: KeyboardEvent): void {
    if (!this.isOpen || !this.dialogBoxRef) {
      return;
    }

    const focusable = this.dialogBoxRef.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}