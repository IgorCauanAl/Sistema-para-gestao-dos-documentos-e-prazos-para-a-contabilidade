import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { SolicitacaoTableComponent } from './solicitacao-table.component';

describe('SolicitacaoTableComponent', () => {
  let component: SolicitacaoTableComponent;
  let fixture: ComponentFixture<SolicitacaoTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoTableComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
