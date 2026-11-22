import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from '../app.routes';

/** Providers padrão para testes de componentes (rotas reais + HTTP mockado). */
export const testProviders: Array<Provider | EnvironmentProviders> = [
  provideRouter(routes),
  provideHttpClient(),
  provideHttpClientTesting(),
];
