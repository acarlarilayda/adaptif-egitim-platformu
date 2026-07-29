import { Component, Input, TemplateRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Md.8: "Büyük veri listelerinde ... virtual scroll kullanılmalıdır."
 *
 * Elle yazılmış (harici bağımlılık gerektirmeyen) bir pencereleme
 * (windowing) uygulaması: DOM'a her zaman yalnızca görünür satırlar +
 * küçük bir tampon (buffer) render edilir, geri kalanı bir "spacer" ile
 * temsil edilir. Hangi satırın nasıl çizileceğini bilmez — bunu her
 * kullanan sayfa kendi `<ng-template>`'i üzerinden verir (content
 * projection), bu yüzden herhangi bir liste için tekrar kullanılabilir.
 */
@Component({
  selector: 'app-virtual-scroll-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-scroll-list.component.html',
  styleUrl: './virtual-scroll-list.component.scss',
})
export class VirtualScrollListComponent {
  @Input({ required: true }) items: unknown[] = [];
  @Input({ required: true }) rowTemplate!: TemplateRef<{ $implicit: unknown; index: number }>;
  @Input() itemHeight = 56;
  @Input() viewportHeight = 480;
  @Input() buffer = 5;

  private readonly scrollTop = signal(0);

  readonly totalHeight = computed(() => this.items.length * this.itemHeight);

  private readonly startIndex = computed(() =>
    Math.max(0, Math.floor(this.scrollTop() / this.itemHeight) - this.buffer)
  );

  private readonly visibleCount = computed(
    () => Math.ceil(this.viewportHeight / this.itemHeight) + this.buffer * 2
  );

  private readonly endIndex = computed(() =>
    Math.min(this.items.length, this.startIndex() + this.visibleCount())
  );

  readonly offsetY = computed(() => this.startIndex() * this.itemHeight);

  readonly visibleItems = computed(() =>
    this.items.slice(this.startIndex(), this.endIndex()).map((item, i) => ({
      item,
      index: this.startIndex() + i,
    }))
  );

  onScroll(event: Event): void {
    this.scrollTop.set((event.target as HTMLElement).scrollTop);
  }
}