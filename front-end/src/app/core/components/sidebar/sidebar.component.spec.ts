import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientService } from '../../services/client.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { PrazoService } from '../../services/prazo.service';
import { testProviders } from '../../../testing/test-providers';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match('/deadlines').forEach((req) => req.flush([]));
    http
      .match((req) => req.url === '/customers')
      .forEach((req) =>
        req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 100 })
      );
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recarrega prazos e clientes quando uma mutação notifica o escopo de prazos', async () => {
    const listarPrazos = vi.spyOn(TestBed.inject(PrazoService), 'list').mockResolvedValue([]);
    const listarClientes = vi.spyOn(TestBed.inject(ClientService), 'list').mockResolvedValue([]);

    TestBed.inject(DataRefreshService).notify('deadlines');
    await fixture.whenStable();

    expect(listarPrazos).toHaveBeenCalledTimes(1);
    expect(listarClientes).toHaveBeenCalledTimes(1);
  });

  it('não recarrega contadores para uma notificação exclusiva do dashboard', async () => {
    const listarPrazos = vi.spyOn(TestBed.inject(PrazoService), 'list').mockResolvedValue([]);

    TestBed.inject(DataRefreshService).notify('dashboard');
    await fixture.whenStable();

    expect(listarPrazos).not.toHaveBeenCalled();
  });
});
