import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  template: `
    <div
      class="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class AppShellComponent {}
