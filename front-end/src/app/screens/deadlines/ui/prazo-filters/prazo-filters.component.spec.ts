import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { PrazoFiltersComponent } from './prazo-filters.component';

describe('PrazoFiltersComponent', () => {
  let component: PrazoFiltersComponent;
  let fixture: ComponentFixture<PrazoFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrazoFiltersComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(PrazoFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
