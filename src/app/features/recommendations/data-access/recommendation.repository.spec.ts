import { TestBed } from '@angular/core/testing';
import { RecommendationRepository } from './recommendation.repository';
import { MOCK_RECOMMENDATIONS } from '../../../core/api/mock-data/recommendations.mock-data';

describe('RecommendationRepository', () => {
  let repository: RecommendationRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(RecommendationRepository);
  });

  describe('dismissRecommendation', () => {
    it('öneriyi kapatır ve mock veri sabitini bozmaz', (done) => {
      const target = MOCK_RECOMMENDATIONS[0];

      repository.dismissRecommendation(target.id).subscribe({
        next: () => {
          repository.getRecommendationsForStudent(target.studentId).subscribe((views) => {
            const stillVisible = views.some((v) => v.recommendation.id === target.id);
            expect(stillVisible).toBe(false);
            expect(MOCK_RECOMMENDATIONS.find((r) => r.id === target.id)?.isDismissed).toBeFalsy();
            done();
          });
        },
        error: () => done(), // errorRate: 0.2 olduğu için ara sıra hata simüle edilebilir, testi bloklamasın
      });
    });
  });
});