import { TestBed } from '@angular/core/testing';
import { ExamRepository } from './exam.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { MOCK_EXAM_BLUEPRINTS } from '../../../core/api/mock-data/exam-blueprints.mock-data';

describe('ExamRepository', () => {
  let repository: ExamRepository;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(ExamRepository);
    auditLog = TestBed.inject(AuditLogService);
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
      repository.getExams().subscribe((exams) => {
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
      repository.getExams().subscribe((exams) => {
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

    it('reddedilen bir yayın audit event üretmez', (done) => {
      repository.getExams().subscribe((exams) => {
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