import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div
      class="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
      [class]="className"
      role="progressbar"
      [attr.aria-valuenow]="pct"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded-full transition-all duration-500"
        [class]="tone === 'green' ? 'bg-green-600' : 'bg-indigo-500'"
        [style.width.%]="pct"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input() pct = 0;
  @Input() className = '';
  @Input() tone: 'indigo' | 'green' = 'indigo';
}
