import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { SolicitacaoFiltersComponent } from './solicitacao-filters.component';

describe('SolicitacaoFiltersComponent', () => {
  let component: SolicitacaoFiltersComponent;
  let fixture: ComponentFixture<SolicitacaoFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoFiltersComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
