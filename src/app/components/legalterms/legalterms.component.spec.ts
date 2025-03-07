import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegaltermsComponent } from './legalterms.component';

describe('LegaltermsComponent', () => {
  let component: LegaltermsComponent;
  let fixture: ComponentFixture<LegaltermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegaltermsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LegaltermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
