import { TestBed } from '@angular/core/testing';

import { DataRefreshService, type RefreshScope } from './data-refresh.service';

describe('DataRefreshService', () => {
  let service: DataRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataRefreshService);
  });

  it('publica os escopos de uma mutação para os assinantes', () => {
    const receivable: Array<ReadonlySet<string>> = [];
    const subscription = service.changes$.subscribe((scopes) => receivable.push(scopes));

    service.notify('documents', 'dashboard');

    expect(receivable).toHaveLength(1);
    expect([...receivable[0]]).toEqual(['documents', 'dashboard']);
    subscription.unsubscribe();
  });

  it('não publica evento sem escopo', () => {
    const listener = vi.fn();
    const subscription = service.changes$.subscribe(listener);

    service.notify();

    expect(listener).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('identifica escopos de interesse de cada consumidor', () => {
    service.notify('deadlines', 'dashboard');

    const scopes = new Set<RefreshScope>(['deadlines', 'dashboard']);
    expect(service.has(scopes, 'documents', 'deadlines')).toBe(true);
    expect(service.has(scopes, 'documents', 'customers')).toBe(false);
  });
});
