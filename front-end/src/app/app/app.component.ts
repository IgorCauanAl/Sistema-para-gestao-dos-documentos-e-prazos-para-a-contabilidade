import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmationHostComponent } from '../core/components/confirmation-host/confirmation-host.component';
import { ToastContainerComponent } from '../core/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmationHostComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
