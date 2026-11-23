import { TestBed } from '@angular/core/testing';

import { NotificationService } from '../services/notification.service';
import { marcarErroTratado } from './api-error';
import { GlobalExceptionHandler } from './global-exception.handler';

describe('GlobalExceptionHandler', () => {
  let handler: GlobalExceptionHandler;
  let notification: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GlobalExceptionHandler] });
    handler = TestBed.inject(GlobalExceptionHandler);
    notification = TestBed.inject(NotificationService);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe um aviso para erros não tratados', () => {
    const errorSpy = vi.spyOn(notification, 'error');
    const erro = new Error('falha não tratada');

    handler.handleError(erro);

    expect(errorSpy).toHaveBeenCalledWith(erro, { marcarTratado: false });
  });

  it('não duplica aviso de erro já tratado por interceptor ou tela', () => {
    const errorSpy = vi.spyOn(notification, 'error');
    const erro = new Error('já exibido');
    marcarErroTratado(erro);

    handler.handleError(erro);

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
