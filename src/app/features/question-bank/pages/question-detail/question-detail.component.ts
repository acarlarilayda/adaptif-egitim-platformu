import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionRepository } from '../../data-access/question.repository';
import { Question } from '../../../../shared/models/question.model';
import { QuestionVersion } from '../../../../shared/models/question-version.model';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.scss',
})
export class QuestionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly questionRepository = inject(QuestionRepository);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly question = signal<Question | null>(null);
  readonly versions = signal<QuestionVersion[]>([]);

  ngOnInit(): void {
    const questionId = this.route.snapshot.paramMap.get('id');
    if (!questionId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.questionRepository.getQuestionById(questionId).subscribe({
      next: (question) => {
        if (!question) {
          this.hasError.set(true);
          this.isLoading.set(false);
          return;
        }
        this.question.set(question);

        this.questionRepository.getVersionsForQuestion(questionId).subscribe({
          next: (versions) => {
            this.versions.set(
              [...versions].sort((a, b) => b.versionNumber - a.versionNumber)
            );
            this.isLoading.set(false);
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}