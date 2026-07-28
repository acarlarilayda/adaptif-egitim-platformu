import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';import { QuestionRepository } from '../../data-access/question.repository';
import { Question, QuestionDifficulty, QuestionType } from '../../../../shared/models/question.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
})
export class QuestionListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly questions = signal<Question[]>([]);
  readonly selectedDifficulty = signal<QuestionDifficulty | 'all'>('all');

  readonly filteredQuestions = computed(() => {
    const difficulty = this.selectedDifficulty();
    const all = this.questions();
    if (difficulty === 'all') {
      return all;
    }
    return all.filter((q) => q.difficulty === difficulty);
  });


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

  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const urlDifficulty = this.route.snapshot.queryParamMap.get('difficulty');
    if (urlDifficulty) {
      this.selectedDifficulty.set(urlDifficulty as QuestionDifficulty | 'all');
    }
    this.loadData();
  }

  onDifficultyChange(difficulty: QuestionDifficulty | 'all'): void {
    this.selectedDifficulty.set(difficulty);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { difficulty: difficulty === 'all' ? null : difficulty },
      queryParamsHandling: 'merge',
    });
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
