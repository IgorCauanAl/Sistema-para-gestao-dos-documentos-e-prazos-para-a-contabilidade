import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideBuilding2, LucideEdit2, LucideMail, LucideMapPin, LucidePaperclip, LucideUser } from '@lucide/angular';

import { formatCnpj } from '../../../../core/domain/cnpj';
import type { Cliente } from '../../../../core/domain/models';

@Component({
  selector: 'app-client-profile-header',
  standalone: true,
  imports: [LucideBuilding2, LucideEdit2, LucideMail, LucideMapPin, LucidePaperclip, LucideUser],
  templateUrl: './client-profile-header.component.html',
  styleUrl: './client-profile-header.component.css',
})
export class ClientProfileHeaderComponent {
  @Input({ required: true }) client!: Cliente;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onAttach = new EventEmitter<void>();

  readonly formatCnpj = formatCnpj;
}
