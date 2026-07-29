import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamFacade } from '../../data-access/exam.facade';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  private readonly facade = inject(ExamFacade);

  readonly isLoading = this.facade.isExamListLoading;
  readonly hasError = this.facade.hasExamListError;
  readonly exams = this.facade.exams;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadExamList();
  }
}