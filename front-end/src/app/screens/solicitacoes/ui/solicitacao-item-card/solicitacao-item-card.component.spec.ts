import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { SolicitacaoItemCardComponent } from './solicitacao-item-card.component';

describe('SolicitacaoItemCardComponent', () => {
  let component: SolicitacaoItemCardComponent;
  let fixture: ComponentFixture<SolicitacaoItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoItemCardComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoItemCardComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      nome: 'Item teste',
      formatoEsperado: 'PDF',
      status: 'PENDENTE',
      tentativas: [],
    } as never;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
