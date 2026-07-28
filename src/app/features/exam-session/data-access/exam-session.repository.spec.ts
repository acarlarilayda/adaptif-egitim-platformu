import { TestBed } from '@angular/core/testing';
import { ExamSessionRepository } from './exam-session.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';

describe('ExamSessionRepository', () => {
  let repository: ExamSessionRepository;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(ExamSessionRepository);
    auditLog = TestBed.inject(AuditLogService);
  });

  describe('saveDraft', () => {
    it('yeni bir cevap taslağını başarıyla kaydeder', (done) => {
      repository.startSession('exam-1', 'u-student-test', 30).subscribe((session) => {
        repository.saveDraft(session.id, 'question-1', 'A', 0).subscribe((draft) => {
          expect(draft.syncStatus).toBe('synced');
          expect(draft.autosaveVersion).toBe(1);
          done();
        });
      });
    });

    it('istemci versiyonu sunucudakinden eskiyse çakışma (conflict) döner', (done) => {
      repository.startSession('exam-1', 'u-student-test-2', 30).subscribe((session) => {
        repository.saveDraft(session.id, 'question-1', 'A', 0).subscribe(() => {
          // Sunucuda şimdi versiyon 1 var. İstemci hâlâ versiyon 0'ı biliyormuş gibi
          // eski bir istekle tekrar kaydetmeye çalışıyor.
          repository.saveDraft(session.id, 'question-1', 'B', 0).subscribe((secondAttempt) => {
            expect(secondAttempt.syncStatus).toBe('conflict');
            done();
          });
        });
      });
    });

    it('güncel versiyonla kaydedilen taslak başka bir çağrıya sızmaz', (done) => {
      repository.startSession('exam-1', 'u-student-test-3', 30).subscribe((session) => {
        repository.saveDraft(session.id, 'question-1', 'A', 0).subscribe((first) => {
          repository.saveDraft(session.id, 'question-1', 'B', first.autosaveVersion).subscribe((second) => {
            expect(second.syncStatus).toBe('synced');
            expect(second.answerValue).toBe('B');
            expect(second.autosaveVersion).toBe(2);
            done();
          });
        });
      });
    });
  });

  describe('submitSession', () => {
    it('oturumu sonlandırır ve session_terminated audit event üretir', (done) => {
      repository.startSession('exam-1', 'u-student-test-4', 30).subscribe((session) => {
        const before = auditLog.events().length;

        repository.submitSession(session.id).subscribe((updated) => {
          expect(updated?.status).toBe('submitted');
          expect(auditLog.events().length).toBe(before + 1);
          expect(auditLog.events()[0].type).toBe('session_terminated');
          expect(auditLog.events()[0].targetRecordId).toBe(session.id);
          done();
        });
      });
    });

    it("var olmayan oturum id'si için undefined döner", (done) => {
      repository.submitSession('does-not-exist').subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});