import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClientService } from './client.service';

const cliente = (id: number) => ({
  id,
  cnpj: '12.345.678/0001-95',
  legalName: id === 3 ? 'Alpha Tecnologia Ltda' : 'Beta Comércio Ltda',
  responsibleName: 'Carlos Almeida',
  email: 'contato@alphatec.com.br',
  lastSubmissionAt: '2026-10-07T10:00:00',
});

const envelope = (content: ReturnType<typeof cliente>[], totalPages = 1) => ({
  content,
  totalElements: totalPages * 100 - (100 - content.length),
  totalPages,
  number: 0,
  size: 100,
});

describe('ClientService', () => {
  let service: ClientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista clientes vindos da API com paginação e busca', async () => {
    const promessa = service.listPage({ search: 'alpha', page: 1, size: 2 });

    const req = http.expectOne((request) => request.url === '/customers');
    expect(req.request.params.get('search')).toBe('alpha');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('2');
    req.flush({
      content: [cliente(3)],
      totalElements: 11,
      totalPages: 6,
      number: 1,
      size: 2,
    });

    const pagina = await promessa;
    expect(pagina.content.length).toBe(1);
    expect(pagina.content[0].razaoSocial).toBe('Alpha Tecnologia Ltda');
    expect(pagina.content[0].ultimoEnvio).not.toBe('—');
    expect(pagina.totalElements).toBe(11);
  });

  it('percorre todas as páginas para listar clientes em seletores', async () => {
    const promessa = service.list();

    const primeira = http.expectOne((request) => request.url === '/customers');
    expect(primeira.request.params.get('page')).toBe('0');
    primeira.flush(envelope([cliente(3)], 2));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const segunda = http.expectOne((request) => request.url === '/customers');
    expect(segunda.request.params.get('page')).toBe('1');
    segunda.flush({
      ...envelope([cliente(4)], 2),
      number: 1,
    });

    const clientes = await promessa;
    expect(clientes.map((item) => item.id)).toEqual([3, 4]);
  });

  it('não engole falhas ao buscar cliente por id', async () => {
    const promessa = service.getById(77);

    http.expectOne('/customers/77').flush(
      { message: 'Cliente não encontrado.' },
      { status: 404, statusText: 'Not Found' }
    );

    await expect(promessa).rejects.toMatchObject({ status: 404 });
  });

  it('cadastra um cliente enviando os campos do backend', async () => {
    const promessa = service.create({
      cnpj: '12.345.678/0001-95',
      razaoSocial: 'Alpha Tecnologia Ltda',
      responsavel: 'Carlos Almeida',
      email: 'contato@alphatec.com.br',
      endereco: 'Av. Paulista, 1000',
    });

    const req = http.expectOne('/customers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      cnpj: '12.345.678/0001-95',
      legalName: 'Alpha Tecnologia Ltda',
      responsibleName: 'Carlos Almeida',
      email: 'contato@alphatec.com.br',
      fullAddress: 'Av. Paulista, 1000',
      whatsapp: null,
    });

    req.flush({
      ...cliente(9),
      fullAddress: 'Av. Paulista, 1000',
    });

    expect((await promessa).id).toBe(9);
  });

  it('exclui cliente pela API', async () => {
    const promessa = service.remove(9);
    const req = http.expectOne('/customers/9');

    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await promessa;
  });
});
