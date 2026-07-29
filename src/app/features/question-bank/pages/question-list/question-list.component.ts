import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuestionFacade } from '../../data-access/question.facade';
import { Question, QuestionDifficulty, QuestionType } from '../../../../shared/models/question.model';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
})
export class QuestionListComponent implements OnInit {
  private readonly facade = inject(QuestionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = this.facade.isListLoading;
  readonly hasError = this.facade.hasListError;
  readonly questions = this.facade.questions;
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
    this.facade.loadQuestions();
  }

  createNewVersion(question: Question): void {
    const changeNote = `${question.stem.slice(0, 20)}... sorusu güncellendi (demo).`;
    this.facade.createNewVersion(question.id, { points: question.points + 5 }, changeNote);
  }
}