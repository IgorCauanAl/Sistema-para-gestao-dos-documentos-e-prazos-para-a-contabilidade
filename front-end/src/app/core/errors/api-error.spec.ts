import { HttpErrorResponse } from '@angular/common/http';

import {
  ERRO_TRATADO,
  foiTratado,
  marcarErroTratado,
  mensagemErroHttp,
  normalizarErro,
} from './api-error';

describe('normalizarErro', () => {
  it('lê o contrato unificado do back-end (message, code e fieldErrors)', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        status: 400,
        code: 'validation_error',
        message: 'Dados inválidos',
        detail: 'Confira os campos destacados.',
        fieldErrors: { email: ['E-mail é obrigatório'] },
      },
    });

    const normalizado = normalizarErro(error);

    expect(normalizado.status).toBe(400);
    expect(normalizado.code).toBe('VALIDATION_ERROR');
    expect(normalizado.message).toBe('Dados inválidos');
    expect(normalizado.detail).toBe('Confira os campos destacados.');
    expect(normalizado.fieldErrors).toEqual({ email: 'E-mail é obrigatório' });
  });

  it('descarta mensagens genéricas e usa o fallback do status', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { message: 'Erro interno do servidor' },
    });

    expect(mensagemErroHttp(error)).toContain('Tente novamente');
  });

  it('aceita ProblemDetail legado (detail) e mapa errors', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'CNPJ já cadastrado', errors: { cnpj: 'Inválido' } },
    });

    expect(mensagemErroHttp(error)).toBe('CNPJ já cadastrado');
    expect(normalizarErro(error).fieldErrors).toEqual({ cnpj: 'Inválido' });
  });

  it('normaliza Error, string e objeto simples', () => {
    expect(normalizarErro(new Error('Falha no template')).message).toBe('Falha no template');
    expect(normalizarErro('Falha simples').message).toBe('Falha simples');
    expect(normalizarErro({ status: 404, message: 'Não encontrado' }).status).toBe(404);
  });

  it('usa UNKNOWN para erros sem status', () => {
    const normalizado = normalizarErro(new Error('Sem conexão'));

    expect(normalizado.status).toBe(0);
    expect(normalizado.code).toBe('UNKNOWN');
  });
});

describe('marcação de erro tratado', () => {
  it('marca o erro para o handler global não duplicar o aviso', () => {
    const error = { message: 'já exibido' };

    expect(foiTratado(error)).toBe(false);
    marcarErroTratado(error);
    expect(foiTratado(error)).toBe(true);
    expect((error as Record<symbol, unknown>)[ERRO_TRATADO]).toBe(true);
  });

  it('não marca valores primitivos', () => {
    expect(() => marcarErroTratado('erro')).not.toThrow();
    expect(foiTratado('erro')).toBe(false);
  });
});
