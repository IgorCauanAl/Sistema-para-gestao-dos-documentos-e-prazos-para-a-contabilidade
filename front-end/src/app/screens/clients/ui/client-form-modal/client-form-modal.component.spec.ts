import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CNPJ_INVALID_MESSAGE } from '../../../../core/domain/cnpj';

import { testProviders } from '../../../../testing/test-providers';

import { ClientFormModalComponent } from './client-form-modal.component';

describe('ClientFormModalComponent', () => {
  let component: ClientFormModalComponent;
  let fixture: ComponentFixture<ClientFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFormModalComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('bloqueia o envio com verificadores incorretos usando a mensagem única', () => {
    const enviar = vi.spyOn(component.onSubmit, 'emit');
    component.formData = { ...component.formData, cnpj: '12.345.678/0001-90' };

    component.submit(new Event('submit'));

    expect(component.erroCnpjExibido).toBe(CNPJ_INVALID_MESSAGE);
    expect(enviar).not.toHaveBeenCalled();
  });

  it('exibe o erro de campo devolvido pela API', () => {
    component.fieldErrors = { legalName: 'A razão social é obrigatória' };

    expect(component.erroDoCampo('razaoSocial')).toBe('A razão social é obrigatória');
  });
});
