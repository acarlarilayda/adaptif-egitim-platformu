import { TestBed } from '@angular/core/testing';
import { AppEventBusService } from './app-event-bus.service';

describe('AppEventBusService', () => {
  let bus: AppEventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    bus = TestBed.inject(AppEventBusService);
  });

  it('belirli bir tipte yayınlanan olayı dinleyicilere iletir', (done) => {
    bus.on<{ outcomeId: string }>('outcome:published').subscribe((payload) => {
      expect(payload.outcomeId).toBe('outcome-1');
      done();
    });

    bus.emit('outcome:published', { outcomeId: 'outcome-1' });
  });

  it('farklı tipteki olayları birbirine karıştırmaz', (done) => {
    let wrongTypeReceived = false;

    bus.on('exam:published').subscribe(() => {
      wrongTypeReceived = true;
    });

    bus.on('outcome:published').subscribe(() => {
      expect(wrongTypeReceived).toBe(false);
      done();
    });

    bus.emit('outcome:published', {});
  });
});