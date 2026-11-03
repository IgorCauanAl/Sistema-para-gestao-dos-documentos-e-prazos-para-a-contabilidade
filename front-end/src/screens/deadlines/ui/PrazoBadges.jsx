import React from 'react';
import StatusBadge from '../../../core/components/ui/StatusBadge';
import { statusPrazoMeta, prioridadeMeta } from '../../../core/domain/prazo';

export const PrazoStatusBadge = ({ status }) => {
  const meta = statusPrazoMeta[status];
  if (!meta) return null;
  return <StatusBadge meta={meta} />;
};

export const PrioridadeBadge = ({ prioridade }) => {
  const meta = prioridadeMeta[prioridade];
  if (!meta) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
      {meta.label}
    </span>
  );
};

export const AtrasoBadge = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-red-200 bg-red-100 text-red-700 text-[11px] font-semibold whitespace-nowrap">
    Atrasado
  </span>
);
