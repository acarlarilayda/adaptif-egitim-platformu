import { TestBed } from '@angular/core/testing';
import { OutcomeRepository } from './outcome.repository';
import { AuditLogService } from '../../../core/observability/audit-log.service';

describe('OutcomeRepository', () => {
  let repository: OutcomeRepository;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(OutcomeRepository);
    auditLog = TestBed.inject(AuditLogService);
  });

  describe('wouldCreateCycle', () => {
    it('bir kazanımın kendisini önkoşul yapmasını döngü olarak işaretler', () => {
      expect(repository.wouldCreateCycle('outcome-1', 'outcome-1')).toBe(true);
    });

    it('mevcut önkoşul zincirinde geriye dönük bağlantı varsa döngü tespit eder', () => {
      // outcome-1 ve outcome-4 farklı derslerde, aralarında ilişki yok.
      const linked = repository.addPrerequisite('outcome-1', 'outcome-4');
      expect(linked.success).toBe(true);

      // outcome-1 artık outcome-4'e bağımlı; tersini eklemek döngü yaratır.
      expect(repository.wouldCreateCycle('outcome-4', 'outcome-1')).toBe(true);
    });

    it('geçerli, döngü oluşturmayan bir önkoşulu false olarak işaretler', () => {
      expect(repository.wouldCreateCycle('outcome-6', 'outcome-1')).toBe(false);
    });
  });

  describe('addPrerequisite', () => {
    it('döngü oluşturacak eklemeyi reddeder', () => {
      const first = repository.addPrerequisite('outcome-1', 'outcome-4');
      expect(first.success).toBe(true);

      const second = repository.addPrerequisite('outcome-4', 'outcome-1');
      expect(second.success).toBe(false);
      expect(second.error).toBe('cycle');
    });

    it('geçerli bir önkoşulu başarıyla ekler', () => {
      const result = repository.addPrerequisite('outcome-6', 'outcome-4');
      expect(result.success).toBe(true);
    });

    it("var olmayan kazanım id'si için not_found döner", () => {
      const result = repository.addPrerequisite('does-not-exist', 'also-not-exist');
      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });
  });

  describe('publish', () => {
    it('yayınlanmamış önkoşulu olan kazanımın yayınını engeller', () => {
      // outcome-6 (taslak) artık outcome-3'e (o da taslak) bağımlı.
      const linked = repository.addPrerequisite('outcome-6', 'outcome-3');
      expect(linked.success).toBe(true);

      const result = repository.publish('outcome-6', 'u-test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('unpublished_prerequisite');
      expect(result.unpublishedPrerequisiteIds).toContain('outcome-3');
    });

    it('geçerli bir kazanımı yayınlar ve audit event üretir', () => {
      // outcome-6: taslak, önkoşulu yok — doğrudan yayınlanabilmeli.
      const before = auditLog.events().length;
      const result = repository.publish('outcome-6', 'u-test');

      expect(result.success).toBe(true);
      expect(auditLog.events().length).toBe(before + 1);
      expect(auditLog.events()[0].type).toBe('publish');
      expect(auditLog.events()[0].targetRecordId).toBe('outcome-6');
    });

    it('var olmayan kazanım için not_found döner', () => {
      const result = repository.publish('does-not-exist', 'u-test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });
  });
});