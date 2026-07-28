import { Directive, ElementRef, EventEmitter, Output, HostListener, inject } from '@angular/core';

/**
 * Bir elemanın dışına tıklandığında bildirim verir.
 * Açık dropdown/menü/popover gibi bileşenleri kapatmak için kullanılır.
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Output() appClickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement): void {
    if (!this.elementRef.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }
}