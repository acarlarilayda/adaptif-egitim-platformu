import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosaveIndicatorComponent } from './autosave-indicator.component';

describe('AutosaveIndicatorComponent', () => {
  let component: AutosaveIndicatorComponent;
  let fixture: ComponentFixture<AutosaveIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutosaveIndicatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutosaveIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
