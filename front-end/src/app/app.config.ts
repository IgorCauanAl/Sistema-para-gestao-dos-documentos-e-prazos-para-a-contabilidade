import { ApplicationConfig, ErrorHandler, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  DoughnutController,
  PointElement,
  Tooltip,
} from 'chart.js';
import { provideCharts } from 'ng2-charts';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { GlobalExceptionHandler } from './core/errors/global-exception.handler';
import { errorToastInterceptor } from './core/interceptors/error-toast.interceptor';
import { sessionExpiredInterceptor } from './core/interceptors/session-expired.interceptor';

// Datas exibidas em português do Brasil (pipe `date` do Angular).
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: ErrorHandler, useClass: GlobalExceptionHandler },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Stateless: o JWT é enviado pelo interceptor no header Authorization.
    provideHttpClient(
      withFetch(),
      withInterceptors([authTokenInterceptor, sessionExpiredInterceptor, errorToastInterceptor]),
    ),
    provideCharts({
      registerables: [
        LineController,
        BarController,
        DoughnutController,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Filler,
        Legend,
        Tooltip,
      ],
    }),
  ],
};
