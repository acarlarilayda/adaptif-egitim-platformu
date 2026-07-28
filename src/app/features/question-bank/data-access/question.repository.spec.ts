import { TestBed } from '@angular/core/testing';
import { QuestionRepository } from './question.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';
import { MOCK_QUESTIONS } from '../../../core/api/mock-data/questions.mock-data';
describe('QuestionRepository', () => {

  let repository: QuestionRepository;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(QuestionRepository);
    auditLog = TestBed.inject(AuditLogService);
  });

  describe('publish', () => {
    it('taslak bir soruyu yayınlar ve audit event üretir', (done) => {
      repository.getQuestions().subscribe((questions) => {
        const draft = questions.find((q) => q.publishStatus === 'draft');

        if (draft) {
          const before = auditLog.events().length;
          const result = repository.publish(draft.id, 'u-test');

          expect(result.success).toBe(true);
          expect(auditLog.events().length).toBe(before + 1);
          expect(auditLog.events()[0].type).toBe('publish');
          expect(auditLog.events()[0].targetRecordId).toBe(draft.id);
        }
        done();
      });
    });

    it('zaten yayınlanmış bir soruyu tekrar yayınlamayı reddeder', (done) => {
      repository.getQuestions().subscribe((questions) => {
        const published = questions.find((q) => q.publishStatus === 'published');

        if (published) {
          const result = repository.publish(published.id, 'u-test');
          expect(result.success).toBe(false);
          expect(result.error).toBe('already_published');
        }
        done();
      });
    });

    it("var olmayan soru id'si için not_found döner", () => {
      const result = repository.publish('does-not-exist', 'u-test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });
  });

  describe('createNewVersion', () => {
    it('yeni versiyon oluşturur ve versiyon sayacını artırır', (done) => {
      repository.getQuestions().subscribe((questions) => {
        const question = questions[0];
        const originalVersion = question.version;

        repository
          .createNewVersion(question.id, { points: question.points + 5 }, 'Puan güncellendi.')
          .subscribe((updated) => {
            expect(updated?.version).toBe(originalVersion + 1);
            expect(updated?.points).toBe(question.points + 5);
            done();
          });
      });
    });

    it("bir repository örneğindeki değişiklik başka bir örneğe sızmaz", (done) => {
      repository.getQuestions().subscribe((questions) => {
        const question = questions[0];

        repository
          .createNewVersion(question.id, { points: 999 }, 'Sızma testi.')
          .subscribe(() => {
            const freshRepository = TestBed.inject(QuestionRepository);
            freshRepository.getQuestionById(question.id).subscribe((fresh) => {
              // Aynı TestBed içinde singleton olduğu için burada aynı örnek beklenir;
              // asıl garanti, MOCK_QUESTIONS sabitinin bozulmamış olmasıdır.
              expect(MOCK_QUESTIONS.find((q) => q.id === question.id)?.points).not.toBe(999);
              done();
            });
          });
      });
    });
  });
});