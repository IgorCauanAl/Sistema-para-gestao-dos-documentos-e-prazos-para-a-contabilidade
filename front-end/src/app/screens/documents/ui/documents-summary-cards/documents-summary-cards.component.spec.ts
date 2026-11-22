import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { DocumentsSummaryCardsComponent } from './documents-summary-cards.component';

describe('DocumentsSummaryCardsComponent', () => {
  let component: DocumentsSummaryCardsComponent;
  let fixture: ComponentFixture<DocumentsSummaryCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsSummaryCardsComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsSummaryCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
