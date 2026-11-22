import { Component, EventEmitter, Input, Output } from '@angular/core';

import { OPCOES_ANTECEDENCIA } from '../../../domain/documento';

@Component({
  selector: 'app-prazo-fields',
  standalone: true,
  templateUrl: './prazo-fields.component.html',
  styleUrl: './prazo-fields.component.css',
})
export class PrazoFieldsComponent {
  @Input() vencimento = '';
  @Input() diasAntecedencia = 3;
  @Input() vencimentoObrigatorio = false;
  @Output() onVencimentoChange = new EventEmitter<string>();
  @Output() onDiasAntecedenciaChange = new EventEmitter<number>();
  readonly opcoes = OPCOES_ANTECEDENCIA;
}
