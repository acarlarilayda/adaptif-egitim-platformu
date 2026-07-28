import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamRepository } from '../../data-access/exam.repository';
import { Exam } from '../../../../shared/models/exam.model';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  private readonly examRepository = inject(ExamRepository);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly exams = signal<Exam[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.examRepository.getExams().subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}