import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const REFRESH_SCOPES = [
  'customers',
  'documents',
  'deadlines',
  'requests',
  'dashboard',
] as const;

export type RefreshScope = (typeof REFRESH_SCOPES)[number];

/**
 * Barramento de consistência pós-mutação.
 *
 * A tela que origina a mudança continua chamando seu próprio `refresh()`;
 * este serviço avisa apenas os componentes persistentes (sidebar/top-nav) e
 * o dashboard de que seus dados derivados precisam ser recarregados.
 */
@Injectable({ providedIn: 'root' })
export class DataRefreshService {
  private readonly subject = new Subject<ReadonlySet<RefreshScope>>();

  readonly changes$: Observable<ReadonlySet<RefreshScope>> = this.subject.asObservable();

  notify(...scopes: RefreshScope[]): void {
    if (scopes.length === 0) return;
    this.subject.next(new Set(scopes));
  }

  has(scopes: ReadonlySet<RefreshScope>, ...wanted: RefreshScope[]): boolean {
    return wanted.some((scope) => scopes.has(scope));
  }
}
