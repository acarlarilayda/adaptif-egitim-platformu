import { TestBed } from '@angular/core/testing';
import { retry } from 'rxjs';
import { ExamRepository } from './exam.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MOCK_EXAM_BLUEPRINTS } from '../../../core/api/mock-data/exam-blueprints.mock-data';

describe('ExamRepository', () => {
  let repository: ExamRepository;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(ExamRepository);
    auditLog = TestBed.inject(AuditLogService);

    // publish() artık role-bazlı yetki kontrolü yapıyor; testler
    // yetkili bir rolle (Eğitmen) çalışmalı. Ayrıca mock API'nin
    // rastgele hata simülasyonuna karşı dayanıklı olmak için
    // getExams() çağrılarını retry ile sarıyoruz.
    TestBed.inject(AuthService).switchUser('u-instructor-1');
  });

  describe('isBlueprintFullySatisfied', () => {
    it('kısıtları karşılanmayan mevcut blueprint için false döner', () => {
      const blueprint = MOCK_EXAM_BLUEPRINTS[0];
      expect(repository.isBlueprintFullySatisfied(blueprint)).toBe(false);
    });

    it('hiç kısıtı olmayan bir blueprint için her zaman true döner', () => {
      const emptyBlueprint = { ...MOCK_EXAM_BLUEPRINTS[0], constraints: [] };
      expect(repository.isBlueprintFullySatisfied(emptyBlueprint)).toBe(true);
    });
  });

  describe('publish', () => {
    it('blueprint hedefleri karşılanmamışsa sınavı yayınlamayı reddeder', (done) => {
      repository.getExams().pipe(retry(5)).subscribe((exams) => {
        const draftExam = exams.find((e) => e.publishStatus === 'draft');

        if (draftExam) {
          const result = repository.publish(draftExam.id, 'u-test');
          expect(result.success).toBe(false);
          expect(result.error).toBe('blueprint_not_satisfied');
        }
        done();
      });
    });

    it('zaten yayınlanmış bir sınavı tekrar yayınlamayı reddeder', (done) => {
      repository.getExams().pipe(retry(5)).subscribe((exams) => {
        const publishedExam = exams.find((e) => e.publishStatus === 'published');

        if (publishedExam) {
          const result = repository.publish(publishedExam.id, 'u-test');
          expect(result.success).toBe(false);
          expect(result.error).toBe('already_published');
        }
        done();
      });
    });

    it("var olmayan sınav id'si için not_found döner", () => {
      const result = repository.publish('does-not-exist', 'u-test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });

    it('yetkisiz bir rol yayın yapmaya çalıştığında reddedilir', () => {
      TestBed.inject(AuthService).switchUser('u-student-1');
      const result = repository.publish('exam-1', 'u-student-1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('unauthorized');
    });

    it('reddedilen bir yayın audit event üretmez', (done) => {
      repository.getExams().pipe(retry(5)).subscribe((exams) => {
        const draftExam = exams.find((e) => e.publishStatus === 'draft');

        if (draftExam) {
          const before = auditLog.events().length;
          repository.publish(draftExam.id, 'u-test');
          expect(auditLog.events().length).toBe(before);
        }
        done();
      });
    });
  });
});