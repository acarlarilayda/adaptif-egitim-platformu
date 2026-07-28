import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Bir input/textarea/button elemanına, DOM'a eklendiğinde otomatik
 * odak verir. Onay pencereleri gibi diyaloglarda klavye erişilebilirliği
 * için kullanılır.
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    queueMicrotask(() => this.elementRef.nativeElement.focus());
  }
}