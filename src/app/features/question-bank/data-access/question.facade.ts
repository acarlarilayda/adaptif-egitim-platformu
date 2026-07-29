import { Injectable, inject } from '@angular/core';
import { QuestionRepository } from './question.repository';
import { QuestionStore } from '../state/question.store';
import { PublishQuestionResult } from '../models/question-operations.model';
import { Question } from '../../../shared/models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionFacade {
  private readonly repository = inject(QuestionRepository);
  private readonly store = inject(QuestionStore);

  readonly questions = this.store.questions;
  readonly isListLoading = this.store.isListLoading;
  readonly hasListError = this.store.hasListError;

  readonly selectedQuestion = this.store.selectedQuestion;
  readonly selectedVersions = this.store.selectedVersions;
  readonly isDetailLoading = this.store.isDetailLoading;
  readonly hasDetailError = this.store.hasDetailError;

  loadQuestions(): void {
    this.store.startListLoading();
    this.repository.getQuestions().subscribe({
      next: (questions) => this.store.setQuestions(questions),
      error: () => this.store.setListError(),
    });
  }

  loadQuestionDetail(questionId: string): void {
    this.store.startDetailLoading();
    this.repository.getQuestionById(questionId).subscribe({
      next: (question) => {
        if (!question) {
          this.store.setDetailError();
          return;
        }
        this.repository.getVersionsForQuestion(questionId).subscribe({
          next: (versions) => this.store.setDetail(question, versions),
          error: () => this.store.setDetailError(),
        });
      },
      error: () => this.store.setDetailError(),
    });
  }

  createNewVersion(
    questionId: string,
    changes: Partial<Pick<Question, 'stem' | 'options' | 'difficulty' | 'points'>>,
    changeNote: string
  ): void {
    this.repository.createNewVersion(questionId, changes, changeNote).subscribe({
      next: () => this.loadQuestions(),
    });
  }

  publish(questionId: string, userId: string): PublishQuestionResult {
    return this.repository.publish(questionId, userId);
  }
}