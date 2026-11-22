import { HttpErrorResponse } from '@angular/common/http';

import { mensagemErroHttp } from './error-toast.interceptor';

describe('mensagemErroHttp', () => {
  it('usa detail do ProblemDetail quando presente', () => {
    const err = new HttpErrorResponse({
      status: 409,
      error: { detail: 'Já existe um cliente cadastrado com este CNPJ: 86.489.351/0001-23' },
    });
    expect(mensagemErroHttp(err)).toContain('86.489.351/0001-23');
  });

  it('usa fallback por status quando não há detail', () => {
    const err = new HttpErrorResponse({ status: 0, error: null });
    expect(mensagemErroHttp(err)).toContain('conectar ao servidor');
  });
});
