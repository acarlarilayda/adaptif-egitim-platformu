import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Question, QuestionDifficulty, QuestionType } from '../../models/question.model';
import { notBlankValidator } from '../../validators/not-blank.validator';
import { uniqueValueValidator } from '../../validators/unique-value.validator';

export interface QuestionEditorSaveEvent {
  changes: Partial<Pick<Question, 'stem' | 'options' | 'difficulty' | 'points'>>;
  changeNote: string;
}

/**
 * Soru türüne göre (çoktan seçmeli / doğru-yanlış / kısa cevap / açık uçlu)
 * alanları uyarlayan, canlı önizleme gösteren ve Reactive Forms ile
 * cross-field + async validasyon uygulayan soru düzenleyici.
 */
@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-editor.component.html',
  styleUrl: './question-editor.component.scss',
})
export class QuestionEditorComponent implements OnChanges {
  @Input({ required: true }) question!: Question;
  /** Async benzersizlik kontrolü için, düzenlenen soru DIŞINDAKİ diğer soruların kökleri. */
  @Input() existingStems: string[] = [];

  @Output() save = new EventEmitter<QuestionEditorSaveEvent>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly difficultyLabels: Record<QuestionDifficulty, string> = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
  };

  readonly hasChoiceOptions = computed(
    () => this.question?.type === 'multiple_choice' || this.question?.type === 'true_false'
  );

  readonly canAddOption = computed(() => this.question?.type === 'multiple_choice');

  difficultyLabel(): string {
    const value = this.form.get('difficulty')?.value as QuestionDifficulty | undefined;
    return this.difficultyLabels[value ?? 'medium'];
  }

  form: FormGroup = this.buildForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['question']) {
      this.form = this.buildForm();
    }
  }

  private buildForm(): FormGroup {
    const q = this.question;

    const options = this.fb.array(
      (q?.options ?? []).map((o) =>
        this.fb.group({
          text: [o.text, [Validators.required, notBlankValidator()]],
          isCorrect: [o.isCorrect],
        })
      ),
      { validators: this.optionsGroupValidator(q?.type) }
    );

    return this.fb.group({
      stem: [
        q?.stem ?? '',
        [Validators.required, notBlankValidator()],
        [uniqueValueValidator(() => this.existingStems, q?.stem)],
      ],
      difficulty: [q?.difficulty ?? 'medium', Validators.required],
      points: [q?.points ?? 1, [Validators.required, Validators.min(1)]],
      options,
      changeNote: ['', [Validators.required, notBlankValidator()]],
    });
  }

  private optionsGroupValidator(type: QuestionType | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (type !== 'multiple_choice' && type !== 'true_false') {
        return null;
      }
      const array = control as FormArray;
      const nonEmpty = array.controls.filter(
        (c) => (c.get('text')?.value ?? '').trim().length > 0
      );
      const correctCount = array.controls.filter((c) => c.get('isCorrect')?.value === true).length;

      if (nonEmpty.length < 2) {
        return { minOptions: true };
      }
      if (correctCount !== 1) {
        return { exactlyOneCorrect: true };
      }
      return null;
    };
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  /** Tek doğru cevap kuralı: seçilenin dışındaki tüm seçenekleri false yapar. */
  markCorrect(index: number): void {
    this.optionsArray.controls.forEach((control, i) => {
      control.get('isCorrect')?.setValue(i === index);
    });
    this.optionsArray.updateValueAndValidity();
  }

  addOption(): void {
    this.optionsArray.push(
      this.fb.group({
        text: ['', [Validators.required, notBlankValidator()]],
        isCorrect: [false],
      })
    );
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
    this.optionsArray.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.save.emit({
      changes: {
        stem: value.stem,
        difficulty: value.difficulty,
        points: value.points,
        options: this.hasChoiceOptions() ? value.options : this.question.options,
      },
      changeNote: value.changeNote,
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}