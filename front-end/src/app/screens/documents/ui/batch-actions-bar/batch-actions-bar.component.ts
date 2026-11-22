import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCombine, LucideFileDown, LucideRotateCcw, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-batch-actions-bar',
  standalone: true,
  imports: [LucideCombine, LucideFileDown, LucideRotateCcw, LucideX],
  templateUrl: './batch-actions-bar.component.html',
  styleUrl: './batch-actions-bar.component.css',
})
export class BatchActionsBarComponent {
  @Input() count = 0;
  @Input() podeReenviar = false;
  @Input() podeJuntar = false;
  @Input() motivoJuntar: string | null = null;
  @Output() onReenviar = new EventEmitter<void>();
  @Output() onExportar = new EventEmitter<void>();
  @Output() onJuntar = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();
}
