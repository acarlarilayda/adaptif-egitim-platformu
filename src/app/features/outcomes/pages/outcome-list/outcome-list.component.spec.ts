import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { OutcomeListComponent } from './outcome-list.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('OutcomeListComponent', () => {
  let component: OutcomeListComponent;
  let fixture: ComponentFixture<OutcomeListComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [OutcomeListComponent],
    }).compileComponents();

    // Program Yöneticisi: kazanım haritasını yönetebilen tek rol.
    TestBed.inject(AuthService).switchUser('u-program-1');

    fixture = TestBed.createComponent(OutcomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit -> facade.loadData()

    tick(1000); // mock API gecikmesini geçir
    fixture.detectChanges();
  }));

  function findOutcomeItem(title: string): HTMLElement | null {
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('li.outcome-list__item')
    ) as HTMLElement[];
    return (
      items.find(
        (el) => el.querySelector('.outcome-list__title')?.textContent?.trim() === title
      ) ?? null
    );
  }

  function findAddButton(title: string): HTMLButtonElement | null {
    const item = findOutcomeItem(title);
    if (!item) return null;
    const buttons = Array.from(item.querySelectorAll('button')) as HTMLButtonElement[];
    return buttons.find((b) => b.textContent?.includes('Önkoşul Ekle')) ?? null;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gerçek mock veriden ders gruplarını ve kazanımları render eder', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Matematik 9. Sınıf');
    expect(text).toContain('Doğal Sayılarla İşlemler');
    expect(text).toContain('Cebirsel İfadeler');
  });

  it('Ana Akış 1 — döngü oluşturmayan bir önkoşul eklendiğinde başarıyla işlenir', fakeAsync(() => {
    // "Cebirsel İfadeler" (outcome-3) zaten "Rasyonel Sayılar"a (outcome-2) bağlı.
    // "Doğal Sayılarla İşlemler"i (outcome-1) doğrudan önkoşul olarak eklemek
    // (dolaylı olarak zaten önkoşulu olsa da) döngü OLUŞTURMAZ, bu yüzden kabul edilmeli.
    component.prerequisiteControlFor('outcome-3').setValue('outcome-1');
    fixture.detectChanges();

    expect(component.prerequisiteControlFor('outcome-3').valid).toBeTrue();

    const addButton = findAddButton('Cebirsel İfadeler');
    expect(addButton).withContext('Önkoşul Ekle butonu bulunamadı').toBeTruthy();
    expect(addButton!.disabled).toBeFalse();

    addButton!.click();
    fixture.detectChanges();
    tick(1000); // başarılı ekleme sonrası facade otomatik yeniden yükler
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('döngü oluşturacağı için eklenemedi');
  }));

  it('Ana Akış 2 — döngü oluşturacak bir önkoşul form seviyesinde geçersiz sayılır ve reddedilir', () => {
    // "Doğal Sayılarla İşlemler" (outcome-1) zaten "Rasyonel Sayılar"ın (outcome-2)
    // önkoşulu. Tam tersini eklemeye çalışmak (outcome-2'yi outcome-1'in önkoşulu
    // yapmak) doğrudan bir döngü oluşturur; İş Kuralı #1 gereği reddedilmelidir.
    const control = component.prerequisiteControlFor('outcome-1');
    control.setValue('outcome-2');
    fixture.detectChanges();

    // Reactive Forms cross-field validasyonu, submit'e gerek kalmadan formu geçersiz kılmalı.
    expect(control.invalid).toBeTrue();
    expect(control.hasError('cycle')).toBeTrue();

    component.addPrerequisite(
      component.groups().flatMap((g) => g.outcomes).find((o) => o.id === 'outcome-1')!
    );
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('döngü oluşturacağı için eklenemedi');
  });
});