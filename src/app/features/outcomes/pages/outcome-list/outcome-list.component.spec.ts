import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomeListComponent } from './outcome-list.component';

describe('OutcomeListComponent', () => {
  let component: OutcomeListComponent;
  let fixture: ComponentFixture<OutcomeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutcomeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutcomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
