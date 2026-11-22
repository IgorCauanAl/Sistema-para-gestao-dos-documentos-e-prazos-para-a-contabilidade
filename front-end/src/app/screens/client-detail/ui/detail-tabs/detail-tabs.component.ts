import { Component, EventEmitter, Input, Output } from '@angular/core';

export const DETAIL_TABS = ['Documentos', 'Solicitações', 'Prazos', 'Histórico'];

@Component({
  selector: 'app-detail-tabs',
  standalone: true,
  templateUrl: './detail-tabs.component.html',
  styleUrl: './detail-tabs.component.css',
})
export class DetailTabsComponent {
  @Input() activeTab = 'Documentos';
  @Output() onChange = new EventEmitter<string>();
  readonly tabs = DETAIL_TABS;
}
