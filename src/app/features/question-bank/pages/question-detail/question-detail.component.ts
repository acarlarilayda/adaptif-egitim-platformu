import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionFacade } from '../../data-access/question.facade';
import { QuestionEditorComponent, QuestionEditorSaveEvent } from '../../../../shared/components/question-editor/question-editor.component';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, QuestionEditorComponent],
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

  readonly isEditing = signal(false);

  /** QuestionEditor'ün async benzersizlik kontrolü için, düzenlenen soru dışındaki soru kökleri. */
  readonly otherStems = computed(() =>
    this.facade
      .questions()
      .filter((q) => q.id !== this.question()?.id)
      .map((q) => q.stem)
  );

  ngOnInit(): void {
    const questionId = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadQuestionDetail(questionId);
    // Editördeki async benzersizlik kontrolü için soru listesini de arka planda yükler.
    this.facade.loadQuestions();
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  onEditorSave(event: QuestionEditorSaveEvent): void {
    const current = this.question();
    if (!current) {
      return;
    }
    this.facade.createNewVersion(current.id, event.changes, event.changeNote);
    this.isEditing.set(false);
  }
}