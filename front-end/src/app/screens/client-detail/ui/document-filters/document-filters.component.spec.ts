import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { DocumentFiltersComponent } from './document-filters.component';

describe('DocumentFiltersComponent', () => {
  let component: DocumentFiltersComponent;
  let fixture: ComponentFixture<DocumentFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFiltersComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
