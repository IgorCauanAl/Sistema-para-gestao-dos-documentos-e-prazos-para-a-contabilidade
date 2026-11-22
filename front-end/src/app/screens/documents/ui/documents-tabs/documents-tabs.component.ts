import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DirecaoDocumento } from '../../../../core/domain/documento';

@Component({
  selector: 'app-documents-tabs',
  standalone: true,
  templateUrl: './documents-tabs.component.html',
  styleUrl: './documents-tabs.component.css',
})
export class DocumentsTabsComponent {
  @Input() active = 'TODOS';
  @Input() counts: Record<string, number> = {};
  @Output() onChange = new EventEmitter<string>();

  readonly tabs = [
    { id: 'TODOS', label: 'Todos' },
    { id: DirecaoDocumento.SAIDA, label: 'Enviados ao cliente' },
    { id: DirecaoDocumento.ENTRADA, label: 'Recebidos do cliente' },
  ];
}
