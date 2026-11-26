import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { DocumentService } from '../../../core/services/document.service';
import { testProviders } from '../../../testing/test-providers';

import { DocumentSharePageComponent } from './document-share-page.component';

describe('DocumentSharePageComponent', () => {
  let component: DocumentSharePageComponent;
  let fixture: ComponentFixture<DocumentSharePageComponent>;

  beforeEach(async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:documento'),
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [DocumentSharePageComponent],
      providers: [
        ...testProviders,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ token: 'abc' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentSharePageComponent);
    component = fixture.componentInstance;
  });

  it('carrega metadados e registra a visualização ao abrir o arquivo', async () => {
    const service = TestBed.inject(DocumentService);
    const metadados = vi.spyOn(service, 'documentoPublico').mockResolvedValue({
      fileName: 'guia.pdf',
      documentType: 'Guia FGTS',
      competence: '09/2026',
      status: 'ENVIADO',
      fileFormat: 'PDF',
    });
    const arquivo = vi.spyOn(service, 'arquivoPublico').mockResolvedValue(new Blob(['pdf']));

    await component.ngOnInit();

    expect(metadados).toHaveBeenCalledWith('abc');
    expect(arquivo).toHaveBeenCalledWith('abc');
    expect(component.visualizado).toBe(true);
    expect(component.arquivoUrl).toBe('blob:documento');
    expect(component.erro).toBe('');
  });

  it('mostra aviso quando o link expirou', async () => {
    const service = TestBed.inject(DocumentService);
    vi.spyOn(service, 'documentoPublico').mockRejectedValue(new Error('404'));

    await component.ngOnInit();

    expect(component.erro).toContain('não está disponível');
    expect(component.documento).toBeNull();
    expect(component.carregando).toBe(false);
  });
});
