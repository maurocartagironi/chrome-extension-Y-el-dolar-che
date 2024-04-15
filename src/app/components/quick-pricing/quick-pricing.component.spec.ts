import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickPricingComponent } from './quick-pricing.component';

describe('QuickPricingComponent', () => {
  let component: QuickPricingComponent;
  let fixture: ComponentFixture<QuickPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickPricingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuickPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
