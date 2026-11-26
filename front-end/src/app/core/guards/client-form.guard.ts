import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { NotificationService } from '../services/notification.service';

/** Componentes com formulário de cliente expõem este método. */
export interface PodeSair {
  podeSair(): boolean;
}

/** Confirma a saída enquanto houver alterações não salvas no formulário. */
export const clientFormGuard: CanDeactivateFn<PodeSair> = async (component) => {
  if (component.podeSair()) return true;

  const notification = inject(NotificationService);
  const confirma = await notification.confirm({
    title: 'Descartar alterações?',
    message: 'As alterações não salvas serão perdidas. Deseja continuar?',
    confirmLabel: 'Descartar',
    cancelLabel: 'Voltar',
    danger: true,
  });

  return confirma;
};
