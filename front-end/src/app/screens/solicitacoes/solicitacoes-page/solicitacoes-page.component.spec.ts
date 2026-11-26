import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Solicitacao, SolicitacaoNova } from '../../../core/domain/models';
import { ClientService } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { SolicitacaoService } from '../../../core/services/solicitacao.service';
import { testProviders } from '../../../testing/test-providers';

import { SolicitacoesPageComponent } from './solicitacoes-page.component';

const novaSolicitacao: SolicitacaoNova = {
  clienteId: 1,
  titulo: 'Documentos de setembro',
  competencia: '09/2026',
  prazo: '15/10/2026',
  canal: 'E-mail',
  validadeDias: 7,
  itens: [{ nome: 'Guia FGTS', formato: 'PDF' }],
  enviarAgora: false,
};

const solicitacao = { id: 12, clienteId: 1 } as Solicitacao;

describe('SolicitacoesPageComponent', () => {
  let component: SolicitacoesPageComponent;
  let fixture: ComponentFixture<SolicitacoesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacoesPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacoesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega a lista e notifica o shell depois de criar solicitação', async () => {
    const solicitacaoService = TestBed.inject(SolicitacaoService);
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const create = vi.spyOn(solicitacaoService, 'create').mockResolvedValue(solicitacao);
    const list = vi.spyOn(solicitacaoService, 'list').mockResolvedValue([solicitacao]);
    vi.spyOn(TestBed.inject(ClientService), 'list').mockResolvedValue([]);

    await component.handleCreate(novaSolicitacao);

    expect(create).toHaveBeenCalledWith(novaSolicitacao);
    expect(list).toHaveBeenCalledTimes(1);
    expect(component.solicitacoes).toEqual([solicitacao]);
    expect(notify).toHaveBeenCalledWith('requests');
  });
});
