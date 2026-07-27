import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradingListComponent } from './grading-list.component';

describe('GradingListComponent', () => {
  let component: GradingListComponent;
  let fixture: ComponentFixture<GradingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
