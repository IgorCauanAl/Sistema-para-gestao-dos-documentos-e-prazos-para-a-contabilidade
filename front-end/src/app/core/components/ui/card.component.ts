import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6" [class]="className">
      @if (title || action) {
        <div class="flex justify-between items-center mb-6">
          @if (title) {
            <h3 class="text-lg font-semibold text-slate-700">{{ title }}</h3>
          }
          @if (action) {
            <div><ng-content select="[cardAction]"></ng-content></div>
          }
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() title = '';
  @Input() action = false;
  @Input() className = '';
}
