import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Cliente, Documento } from '../../../../core/domain/models';

import { DocumentShareModalComponent } from './document-share-modal.component';

const documento = { id: 7, nome: 'guia.pdf', competencia: '09/2026' } as Documento;
const cliente = { id: 1, razaoSocial: 'Empresa SA', whatsapp: '(11) 99999-0000' } as Cliente;

describe('DocumentShareModalComponent', () => {
  let component: DocumentShareModalComponent;
  let fixture: ComponentFixture<DocumentShareModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentShareModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentShareModalComponent);
    component = fixture.componentInstance;
    component.open = true;
    component.documento = documento;
    component.cliente = cliente;
    component.share = { token: 'abc', path: '/d/abc', url: 'http://localhost/d/abc' };
    fixture.detectChanges();
  });

  it('monta o link absoluto e a mensagem com o documento', () => {
    expect(component.link).toBe('http://localhost/d/abc');
    expect(component.mensagem).toContain('guia.pdf');
    expect(component.mensagem).toContain('09/2026');
  });

  it('abre o WhatsApp do cliente usando o telefone cadastrado no servidor', () => {
    const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);

    component.abrirWhatsapp();

    expect(abrir).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5511999990000'),
      '_blank',
      'noopener,noreferrer'
    );
    abrir.mockRestore();
  });

  it('avisa quando o cliente não tem WhatsApp cadastrado', () => {
    component.cliente = { ...cliente, whatsapp: '' };
    const toast = vi.fn();
    component.onToast.subscribe(toast);
    const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);

    component.abrirWhatsapp();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
    expect(abrir).not.toHaveBeenCalled();
    abrir.mockRestore();
  });
});
