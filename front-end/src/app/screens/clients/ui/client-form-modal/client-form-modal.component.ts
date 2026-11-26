import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX } from '@lucide/angular';

import { CNPJ_INVALID_MESSAGE, isValidCnpj, maskCnpjInput } from '../../../../core/domain/cnpj';
import type { Cliente } from '../../../../core/domain/models';

export type ClienteForm = Pick<
  Cliente,
  'cnpj' | 'razaoSocial' | 'responsavel' | 'email' | 'endereco' | 'whatsapp'
>;

const CAMPOS_BACKEND: Record<keyof ClienteForm, string> = {
  cnpj: 'cnpj',
  razaoSocial: 'legalName',
  responsavel: 'responsibleName',
  email: 'email',
  endereco: 'fullAddress',
  whatsapp: 'whatsapp',
};

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX],
  templateUrl: './client-form-modal.component.html',
  styleUrl: './client-form-modal.component.css',
})
export class ClientFormModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Cadastrar Novo Cliente';
  @Input() saving = false;
  @Input() formData: ClienteForm = emptyClienteForm();
  @Input() fieldErrors: Record<string, string> = {};
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();
  @Output() formDataChange = new EventEmitter<ClienteForm>();
  @Output() fieldErrorsChange = new EventEmitter<Record<string, string>>();

  erroCnpj = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) this.erroCnpj = '';
  }

  get erroCnpjExibido(): string {
    return this.erroCnpj || this.erroDoCampo('cnpj');
  }

  erroDoCampo(campo: keyof ClienteForm): string {
    return this.fieldErrors[CAMPOS_BACKEND[campo]] ?? '';
  }

  update(field: keyof ClienteForm, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = field === 'cnpj' ? maskCnpjInput(raw) : raw;
    this.formData = { ...this.formData, [field]: value };
    if (field === 'cnpj' && this.erroCnpj && isValidCnpj(value)) this.erroCnpj = '';
    this.limparErroBackend(field);
    this.formDataChange.emit(this.formData);
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.saving) return;
    if (!this.formData.cnpj.trim()) {
      this.erroCnpj = 'O CNPJ é obrigatório';
    } else if (!isValidCnpj(this.formData.cnpj)) {
      this.erroCnpj = CNPJ_INVALID_MESSAGE;
    } else {
      this.erroCnpj = '';
    }
    if (this.erroCnpj) return;
    this.onSubmit.emit();
  }

  private limparErroBackend(campo: keyof ClienteForm): void {
    const chave = CAMPOS_BACKEND[campo];
    if (!(chave in this.fieldErrors)) return;
    const restantes = { ...this.fieldErrors };
    delete restantes[chave];
    this.fieldErrors = restantes;
    this.fieldErrorsChange.emit(restantes);
  }
}

export function emptyClienteForm(): ClienteForm {
  return { cnpj: '', razaoSocial: '', responsavel: '', email: '', endereco: '', whatsapp: '' };
}
