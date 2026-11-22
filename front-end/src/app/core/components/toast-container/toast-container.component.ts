import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAlertTriangle, LucideCheckCircle2, LucideInfo, LucideX } from '@lucide/angular';
import { Observable } from 'rxjs';

import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAlertTriangle, LucideCheckCircle2, LucideInfo, LucideX],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }
}
