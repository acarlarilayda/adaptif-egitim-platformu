import { TestBed } from '@angular/core/testing';
import { retry } from 'rxjs';
import { GradingRepository } from './grading.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('GradingRepository', () => {
  let repository: GradingRepository;
  let auditLog: AuditLogService;

  const RUBRIC_ID = 'rubric-1';
  const QUESTION_ID = 'question-3';
  const CRITERION_ID = 'criterion-1';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(GradingRepository);
    auditLog = TestBed.inject(AuditLogService);

    // updateCriterionScore() artık role-bazlı yetki kontrolü yapıyor;
    // testler yetkili bir rolle (Eğitmen) çalışmalı.
    TestBed.inject(AuthService).switchUser('u-instructor-1');
  });

  describe('updateCriterionScore', () => {
    it('gerekçe boşsa hatayla reddeder', (done) => {
      repository.getRubricForQuestion(QUESTION_ID).pipe(retry(5)).subscribe(() => {
        repository.updateCriterionScore(RUBRIC_ID, CRITERION_ID, 5, '', 'u-test').subscribe({
          error: (err) => {
            expect(err.message).toContain('gerekçe');
            done();
          },
        });
      });
    });

    it('mock veride zaten puan geçmişi olan bir kriteri değiştirirken override tipinde audit event üretir', (done) => {
      const before = auditLog.events().length;

      repository
        .updateCriterionScore(RUBRIC_ID, CRITERION_ID, 15, 'Yeniden değerlendirme.', 'u-test')
        .subscribe(() => {
          expect(auditLog.events().length).toBe(before + 1);
          expect(auditLog.events()[0].type).toBe('override');
          expect(auditLog.events()[0].targetRecordId).toBe(RUBRIC_ID);
          done();
        });
    });

    it('ardışık ikinci bir değişiklikte de override tipinde audit event üretmeye devam eder', (done) => {
      repository
        .updateCriterionScore(RUBRIC_ID, CRITERION_ID, 15, 'İlk düzeltme.', 'u-test')
        .subscribe(() => {
          const before = auditLog.events().length;

          repository
            .updateCriterionScore(RUBRIC_ID, CRITERION_ID, 18, 'İkinci düzeltme.', 'u-test-2')
            .subscribe(() => {
              expect(auditLog.events().length).toBe(before + 1);
              expect(auditLog.events()[0].type).toBe('override');
              done();
            });
        });
    });

    it('versiyon sayacını artırır', (done) => {
      repository.getRubricForQuestion(QUESTION_ID).pipe(retry(5)).subscribe((rubric) => {
        const originalVersion = rubric!.version;

        repository
          .updateCriterionScore(RUBRIC_ID, CRITERION_ID, 12, 'Versiyon testi.', 'u-test')
          .subscribe((updated) => {
            expect(updated?.version).toBe(originalVersion + 1);
            done();
          });
      });
    });

    it("var olmayan rubric id'si için undefined döner", (done) => {
      repository
        .updateCriterionScore('does-not-exist', CRITERION_ID, 10, 'Test.', 'u-test')
        .subscribe((result) => {
          expect(result).toBeUndefined();
          done();
        });
    });

    it('yetkisiz bir rol puan değişikliği yapmaya çalıştığında reddedilir', (done) => {
      TestBed.inject(AuthService).switchUser('u-student-1');
      repository.updateCriterionScore(RUBRIC_ID, CRITERION_ID, 10, 'Deneme.', 'u-student-1').subscribe({
        error: (err) => {
          expect(err.message).toContain('yetki');
          done();
        },
      });
    });
  });
});