import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title, subtitle }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/50 p-12 flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
      <Inbox size={40} className="text-slate-300" />
    </div>
    <p className="text-base font-semibold text-slate-600">{title}</p>
    {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

export default EmptyState;
