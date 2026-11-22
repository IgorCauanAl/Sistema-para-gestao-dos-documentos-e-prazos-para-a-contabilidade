import { Component, Input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

import type { Prazo } from '../../../../core/domain/models';
import { ETAPAS_PADRAO, prazoEncerrado } from '../../../../core/domain/prazo';

@Component({
  selector: 'app-etapas-checklist',
  standalone: true,
  imports: [LucideCheck],
  templateUrl: './etapas-checklist.component.html',
  styleUrl: './etapas-checklist.component.css',
})
export class EtapasChecklistComponent {
  @Input() prazo!: Prazo;

  readonly etapas = ETAPAS_PADRAO;

  get entregue(): boolean {
    return prazoEncerrado(this.prazo);
  }

  concluida(index: number): boolean {
    return this.prazo.etapasConcluidas.includes(index);
  }

  atual(index: number): boolean {
    return !this.concluida(index) && index === this.prazo.etapaAtual && !this.entregue;
  }
}
