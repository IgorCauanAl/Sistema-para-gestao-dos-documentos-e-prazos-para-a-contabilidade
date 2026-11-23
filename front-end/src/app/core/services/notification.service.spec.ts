import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { foiTratado } from '../errors/api-error';
import { ConfirmationService } from './confirmation.service';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastService: ToastService;
  let confirmation: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    toastService = TestBed.inject(ToastService);
    confirmation = TestBed.inject(ConfirmationService);
  });

  it('abstrai os tipos de toast', () => {
    const show = vi.spyOn(toastService, 'show');

    service.success('Sucesso');
    service.info('Aviso');
    service.warning('Atenção');

    expect(show).toHaveBeenCalledWith('Sucesso', 'success', undefined);
    expect(show).toHaveBeenCalledWith('Aviso', 'info', undefined);
    expect(show).toHaveBeenCalledWith('Atenção', 'warning', undefined);
  });

  it('normaliza o erro do back-end antes de exibir e marca como tratado', () => {
    const show = vi.spyOn(toastService, 'show');
    const error = new HttpErrorResponse({
      status: 409,
      error: { code: 'CONFLICT', message: 'CNPJ já cadastrado' },
    });

    service.error(error);

    expect(show).toHaveBeenCalledWith('CNPJ já cadastrado', 'error', 5000);
    expect(foiTratado(error)).toBe(true);
  });

  it('respeita duração customizada e a opção de não marcar', () => {
    const show = vi.spyOn(toastService, 'show');
    const error = new Error('falha');

    service.error(error, { durationMs: 6000, marcarTratado: false });

    expect(show).toHaveBeenCalledWith('falha', 'error', 6000);
    expect(foiTratado(error)).toBe(false);
  });

  it('delega decisões críticas ao ConfirmationService', async () => {
    const confirm = vi.spyOn(confirmation, 'confirm').mockResolvedValue(true);
    const options = { title: 'Sair?', message: 'Confirma?' };

    await expect(service.confirm(options)).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith(options);
  });
});
