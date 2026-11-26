import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Cliente } from '../../../core/domain/models';
import { ClientService, type ClientePage } from '../../../core/services/client.service';
import { DataRefreshService } from '../../../core/services/data-refresh.service';
import { testProviders } from '../../../testing/test-providers';

import { ClientsPageComponent } from './clients-page.component';

const cliente: Cliente = {
  id: 9,
  cnpj: '12.345.678/0001-95',
  razaoSocial: 'Empresa Atualizada',
  responsavel: 'Marina',
  email: 'marina@empresa.com.br',
  endereco: 'Rua A, 1',
  whatsapp: '',
  canalPreferido: 'E-mail',
  ultimoEnvio: '—',
};

const pagina = (content: Cliente[]): ClientePage => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 10,
});

describe('ClientsPageComponent', () => {
  let component: ClientsPageComponent;
  let fixture: ComponentFixture<ClientsPageComponent>;
  let clientService: ClientService;
  let listPage: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPageComponent],
      providers: testProviders,
    }).compileComponents();

    clientService = TestBed.inject(ClientService);
    listPage = vi.spyOn(clientService, 'listPage').mockResolvedValue(pagina([cliente]));
    fixture = TestBed.createComponent(ClientsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.clients).toEqual([cliente]);
  });

  it('busca no servidor ao digitar no filtro', async () => {
    await component.onSearch({ target: { value: 'alpha' } } as unknown as Event);
    await vi.waitFor(() => expect(listPage).toHaveBeenCalledTimes(2));

    expect(listPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'alpha', page: 0 })
    );
  });

  it('recarrega a lista e notifica o shell depois de cadastrar cliente', async () => {
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const create = vi.spyOn(clientService, 'create').mockResolvedValue(cliente);

    await component.handleSubmit();

    expect(create).toHaveBeenCalledTimes(1);
    expect(listPage).toHaveBeenCalledTimes(2);
    expect(component.clients).toEqual([cliente]);
    expect(notify).toHaveBeenCalledWith('customers', 'dashboard');
  });

  it('recarrega a lista e notifica o shell depois de editar cliente', async () => {
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const update = vi.spyOn(clientService, 'update').mockResolvedValue(cliente);
    vi.spyOn(clientService, 'getById').mockResolvedValue(cliente);
    await component.handleEdit(cliente);

    await component.handleSubmit();

    expect(update).toHaveBeenCalledTimes(1);
    expect(listPage).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledWith('customers', 'dashboard');
  });

  it('recarrega a lista e notifica o shell depois de excluir cliente', async () => {
    const notify = vi.spyOn(TestBed.inject(DataRefreshService), 'notify');
    const remove = vi.spyOn(clientService, 'remove').mockResolvedValue();
    listPage.mockResolvedValue(pagina([]));
    component.clienteParaExcluir = cliente;

    await component.confirmarExclusao();

    expect(remove).toHaveBeenCalledWith(cliente.id);
    expect(listPage).toHaveBeenCalledTimes(2);
    expect(component.clients).toEqual([]);
    expect(notify).toHaveBeenCalledWith(
      'customers',
      'documents',
      'deadlines',
      'requests',
      'dashboard'
    );
  });
});
