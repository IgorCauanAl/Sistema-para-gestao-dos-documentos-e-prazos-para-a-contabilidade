import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('abre o modal com rótulos padrão e resolve true ao confirmar', async () => {
    const promise = service.confirm({ title: 'Sair?', message: 'Confirma?' });

    const request = await firstValueFrom(service.request$);
    expect(request).toMatchObject({
      title: 'Sair?',
      message: 'Confirma?',
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    service.confirmar();
    await expect(promise).resolves.toBe(true);
    expect(await firstValueFrom(service.request$)).toBeNull();
  });

  it('resolve false ao cancelar', async () => {
    const promise = service.confirm({
      title: 'Excluir?',
      message: 'Confirma?',
      confirmLabel: 'Excluir',
      danger: true,
    });

    service.cancelar();

    await expect(promise).resolves.toBe(false);
  });

  it('cancela a decisão pendente se uma nova for aberta', async () => {
    const primeira = service.confirm({ title: 'Primeira', message: '...' });
    const segunda = service.confirm({ title: 'Segunda', message: '...' });

    await expect(primeira).resolves.toBe(false);

    service.confirmar();
    await expect(segunda).resolves.toBe(true);
  });
});
