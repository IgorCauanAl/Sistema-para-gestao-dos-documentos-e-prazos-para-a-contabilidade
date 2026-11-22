import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoSummaryCardsComponent } from './prazo-summary-cards.component';

describe('PrazoSummaryCardsComponent', () => {
  let component: PrazoSummaryCardsComponent;
  let fixture: ComponentFixture<PrazoSummaryCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoSummaryCardsComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoSummaryCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
