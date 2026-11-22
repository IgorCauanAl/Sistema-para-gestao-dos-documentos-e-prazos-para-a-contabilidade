import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX } from '@lucide/angular';

import { isValidCnpj, maskCnpjInput } from '../../../../core/domain/cnpj';
import type { Cliente } from '../../../../core/domain/models';

export type ClienteForm = Pick<Cliente, 'cnpj' | 'razaoSocial' | 'responsavel' | 'email' | 'endereco'>;

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [LucideBuilding2, LucideFileText, LucideMail, LucideMapPin, LucideUser, LucideX],
  templateUrl: './client-form-modal.component.html',
  styleUrl: './client-form-modal.component.css',
})
export class ClientFormModalComponent {
  @Input() open = false;
  @Input() title = 'Cadastrar Novo Cliente';
  @Input() saving = false;
  @Input() formData: ClienteForm = emptyClienteForm();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();
  @Output() formDataChange = new EventEmitter<ClienteForm>();

  erroCnpj = '';

  update(field: keyof ClienteForm, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = field === 'cnpj' ? maskCnpjInput(raw) : raw;
    this.formData = { ...this.formData, [field]: value };
    if (field === 'cnpj' && this.erroCnpj && isValidCnpj(value)) this.erroCnpj = '';
    this.formDataChange.emit(this.formData);
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.saving) return;
    if (!isValidCnpj(this.formData.cnpj)) {
      this.erroCnpj = 'Informe um CNPJ válido no formato 00.000.000/0000-00.';
      return;
    }
    this.erroCnpj = '';
    this.onSubmit.emit();
  }
}

export function emptyClienteForm(): ClienteForm {
  return { cnpj: '', razaoSocial: '', responsavel: '', email: '', endereco: '' };
}
