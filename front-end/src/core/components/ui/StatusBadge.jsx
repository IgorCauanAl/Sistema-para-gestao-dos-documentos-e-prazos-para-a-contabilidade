import React from 'react';
import { documentStatusMeta } from '../../domain/documento';

const StatusBadge = ({ status, meta, className = '' }) => {
  const info = meta ?? documentStatusMeta[status];

  if (!info) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${info.badge} ${className}`}
    >
      {info.label}
    </span>
  );
};

export default StatusBadge;
