import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionRepository } from '../../data-access/question.repository';
import { Question, QuestionDifficulty, QuestionType } from '../../../../shared/models/question.model';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
})
export class QuestionListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly questions = signal<Question[]>([]);

  readonly difficultyLabels: Record<QuestionDifficulty, string> = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor',
  };

  readonly typeLabels: Record<QuestionType, string> = {
    multiple_choice: 'Çoktan Seçmeli',
    true_false: 'Doğru/Yanlış',
    short_answer: 'Kısa Cevap',
    essay: 'Açık Uçlu',
  };

  constructor(private readonly questionRepository: QuestionRepository) {}

  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.questionRepository.getQuestions().subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  createNewVersion(question: Question): void {
    const changeNote = `${question.stem.slice(0, 20)}... sorusu güncellendi (demo).`;
    this.questionRepository
      .createNewVersion(question.id, { points: question.points + 5 }, changeNote)
      .subscribe({
        next: () => {
          this.loadData();
        },
      });
  }
}
