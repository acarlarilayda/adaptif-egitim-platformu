import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { QuestionEditorComponent, QuestionEditorSaveEvent } from './question-editor.component';
import { Question } from '../../models/question.model';

function buildQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'question-1',
    type: 'multiple_choice',
    outcomeId: 'outcome-1',
    stem: 'İki artı iki kaçtır?',
    options: [
      { id: 'opt-1', text: 'Dört', isCorrect: true },
      { id: 'opt-2', text: 'Beş', isCorrect: false },
    ],
    solutionExplanation: '',
    difficulty: 'easy',
    tags: [],
    points: 10,
    publishStatus: 'draft',
    currentVersionId: 'v1',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
    version: 1,
    ...overrides,
  };
}

describe('QuestionEditorComponent', () => {
  let component: QuestionEditorComponent;
  let fixture: ComponentFixture<QuestionEditorComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuestionEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionEditorComponent);
    component = fixture.componentInstance;
    component.question = buildQuestion();
    component.existingStems = ['Üç çarpı üç kaçtır?', 'Beş eksi iki kaçtır?'];
    component.ngOnChanges({ question: true } as any);
    fixture.detectChanges();
    tick(200); // async stem (uniqueValueValidator) validasyonunun tamamlanmasını bekle
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeNote girilmeden form geçersizdir (gerekçe zorunlu)', () => {
    expect(component.form.get('changeNote')?.value).toBe('');
    expect(component.form.invalid).toBeTrue();
  });

  it('stem, options ve changeNote geçerliyken form valid olur', fakeAsync(() => {
    component.form.get('changeNote')?.setValue('Test amaçlı değişiklik notu.');
    tick(200);

    expect(component.form.valid).toBeTrue();
  }));

  it('Ana Akış — cross-field validasyon: iki seçenek de doğru işaretlenirse form geçersiz olur', () => {
    component.optionsArray.at(1).get('isCorrect')?.setValue(true);
    component.optionsArray.updateValueAndValidity();
    fixture.detectChanges();

    expect(component.optionsArray.hasError('exactlyOneCorrect')).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  });

  it('Ana Akış — cross-field validasyon: 2 seçenekten biri silinirse "en az 2 seçenek" hatası verir', () => {
    component.removeOption(1);
    fixture.detectChanges();

    expect(component.optionsArray.hasError('minOptions')).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  });

  it('Ana Akış — async validasyon: soru kökü mevcut başka bir soruyla birebir aynıysa reddedilir', fakeAsync(() => {
    component.form.get('stem')?.setValue('Üç çarpı üç kaçtır?');
    component.form.get('stem')?.markAsTouched();
    tick(200); // uniqueValueValidator'ın simüle edilmiş gecikmesi

    expect(component.form.get('stem')?.hasError('notUnique')).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  }));

  it('form geçersizken submit edilirse save event yayınlanmaz', () => {
    const saveSpy = jasmine.createSpy('save');
    component.save.subscribe(saveSpy);

    component.removeOption(1); // formu geçersiz kılar (minOptions)
    component.submit();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('Ana Akış — form geçerliyken submit edilirse doğru değerlerle save event yayınlanır', fakeAsync(() => {
    let emitted: QuestionEditorSaveEvent | undefined;
    component.save.subscribe((event) => (emitted = event));

    component.form.get('stem')?.setValue('Dört artı dört kaçtır?');
    component.form.get('points')?.setValue(15);
    component.form.get('changeNote')?.setValue('Soru kökü netleştirildi.');
    tick(200); // async stem validator'ının tamamlanmasını bekle

    component.submit();

    expect(emitted).toBeDefined();
    expect(emitted!.changes.stem).toBe('Dört artı dört kaçtır?');
    expect(emitted!.changes.points).toBe(15);
    expect(emitted!.changeNote).toBe('Soru kökü netleştirildi.');
  }));
});