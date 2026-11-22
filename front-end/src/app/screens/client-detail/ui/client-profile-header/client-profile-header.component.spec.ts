import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testProviders } from '../../../../testing/test-providers';

import { ClientProfileHeaderComponent } from './client-profile-header.component';

describe('ClientProfileHeaderComponent', () => {
  let component: ClientProfileHeaderComponent;
  let fixture: ComponentFixture<ClientProfileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfileHeaderComponent],
      providers: testProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProfileHeaderComponent);
    component = fixture.componentInstance;
    component.client = {
      id: 1,
      razaoSocial: 'Cliente teste',
      nomeFantasia: 'Cliente teste',
      cnpj: '00000000000191',
      email: 'cliente@teste.com',
      telefone: '',
      ativo: true,
    } as never;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
