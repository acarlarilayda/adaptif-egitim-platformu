import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div id="inside" (appClickOutside)="onOutside()">İçerik</div>
    <div id="outside">Dışarısı</div>
  `,
})
class TestHostComponent {
  outsideClicked = false;
  onOutside(): void {
    this.outsideClicked = true;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('elemanın dışına tıklanınca event fırlatır', () => {
    const outside = fixture.nativeElement.querySelector('#outside') as HTMLElement;
    outside.click();
    expect(fixture.componentInstance.outsideClicked).toBe(true);
  });

  it('elemanın içine tıklanınca event fırlatmaz', () => {
    const inside = fixture.nativeElement.querySelector('#inside') as HTMLElement;
    inside.click();
    expect(fixture.componentInstance.outsideClicked).toBe(false);
  });
});