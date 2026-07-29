import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionFacade } from '../../data-access/question.facade';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-detail.component.html',
  styleUrl: './question-detail.component.scss',
})
export class QuestionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(QuestionFacade);

  readonly isLoading = this.facade.isDetailLoading;
  readonly hasError = this.facade.hasDetailError;
  readonly question = this.facade.selectedQuestion;
  readonly versions = this.facade.selectedVersions;

  ngOnInit(): void {
    const questionId = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadQuestionDetail(questionId);
  }
}