import { Directive, EventEmitter, Output, HostListener, OnDestroy } from '@angular/core';
import { Subject, Subscription, debounceTime } from 'rxjs';

/**
 * (debounceClick)="onSave()" — arama kutusu / hızlı tekrarlanan tıklama
 * senaryolarında (örn. autosave tetikleyen input, çift tıklamayı önleyen
 * submit butonu) gereksiz tekrar çağrıyı engeller.
 */
@Directive({
  selector: '[appDebounceClick]',
  standalone: true,
})
export class DebounceClickDirective implements OnDestroy {
  @Output() debounceClick = new EventEmitter<Event>();

  private readonly clicks = new Subject<Event>();
  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.clicks.pipe(debounceTime(300)).subscribe((event) => {
      this.debounceClick.emit(event);
    });
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}