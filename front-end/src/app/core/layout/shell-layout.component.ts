import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../components/sidebar.component';
import { TopNavComponent } from '../components/top-nav.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopNavComponent],
  template: `
    <div class="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden">
      <app-sidebar></app-sidebar>

      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <app-top-nav></app-top-nav>
        <div class="flex-1 overflow-y-auto p-4 md:p-8"><router-outlet></router-outlet></div>
      </main>
    </div>
  `,
})
export class ShellLayoutComponent {}
