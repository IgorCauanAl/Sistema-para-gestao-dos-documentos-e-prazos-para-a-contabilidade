import { Component, EventEmitter, Input, Output } from '@angular/core';

export const DETAIL_TABS = ['Documentos', 'Solicitações', 'Prazos', 'Histórico'];

@Component({
  selector: 'app-detail-tabs',
  standalone: true,
  template: `
    <div class="flex flex-wrap p-1.5 bg-slate-100 rounded-full gap-1 w-fit" role="tablist">
      @for (tab of tabs; track tab) {
        <button
          role="tab"
          type="button"
          [attr.aria-selected]="activeTab === tab"
          (click)="onChange.emit(tab)"
          class="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          [class]="
            activeTab === tab
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          "
        >
          {{ tab }}
        </button>
      }
    </div>
  `,
})
export class DetailTabsComponent {
  @Input() activeTab = 'Documentos';
  @Output() onChange = new EventEmitter<string>();
  readonly tabs = DETAIL_TABS;
}
