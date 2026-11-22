import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirecaoDocumento } from '../../../core/domain/documento';
import { testProviders } from '../../../testing/test-providers';

import { DocumentsPageComponent } from './documents-page.component';

const documento = (id: number, direction: string) => ({
  id,
  customerId: 1,
  documentType: 'Guia FGTS',
  competence: '09/2026',
  dueDate: null,
  sendChannel: 'WHATSAPP',
  direction,
  status: 'ENVIADO',
  fileFormat: 'PDF',
  fileName: `documento-${id}.pdf`,
  createdIn: '2026-10-02T10:12:00',
});

describe('DocumentsPageComponent', () => {
  let component: DocumentsPageComponent;
  let fixture: ComponentFixture<DocumentsPageComponent>;
  let http: HttpTestingController;

  const flushCarregamento = (): void => {
    http.match('/customers').forEach((req) => req.flush([]));
    http.match('/documents').forEach((req) =>
      req.flush([
        documento(1, 'ENVIADO_AO_CLIENTE'),
        documento(2, 'RECEBIDO_DO_CLIENTE'),
      ])
    );
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsPageComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    flushCarregamento();
    expect(component).toBeTruthy();
  });

  it('recarrega a listagem com a direção da aba selecionada', async () => {
    flushCarregamento();
    await fixture.whenStable();

    const promessa = component.setTab(DirecaoDocumento.ENTRADA);
    flushCarregamento();
    await promessa;

    expect(component.docs?.length).toBe(1);
    expect(component.docs?.every((doc) => doc.direcao === DirecaoDocumento.ENTRADA)).toBe(true);
    expect(component.todosOsDocs.some((doc) => doc.direcao === DirecaoDocumento.SAIDA)).toBe(true);
  });
});
