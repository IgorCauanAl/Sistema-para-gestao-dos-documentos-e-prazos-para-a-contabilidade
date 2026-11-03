import React from 'react';
import { AlertTriangle, CalendarClock, CalendarRange, ListChecks } from 'lucide-react';

const cards = [
  { id: 'ATRASADOS', label: 'Atrasados', icon: AlertTriangle, tone: 'text-red-600 bg-red-50' },
  { id: 'HOJE', label: 'Vencem hoje', icon: CalendarClock, tone: 'text-orange-600 bg-orange-50' },
  { id: 'SEMANA', label: 'Vencem nesta semana', icon: CalendarRange, tone: 'text-amber-600 bg-amber-50' },
  { id: 'PENDENTES', label: 'Pendentes', icon: ListChecks, tone: 'text-blue-600 bg-blue-50' },
];

const PrazoSummaryCards = ({ contagens, ativo, onClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map((card) => {
      const Icon = card.icon;
      const active = ativo === card.id;

      return (
        <button
          key={card.id}
          type="button"
          aria-pressed={active}
          onClick={() => onClick(active ? null : card.id)}
          className={`text-left bg-white rounded-3xl shadow-sm border-2 p-5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
            active ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-200/50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-slate-500 truncate">{card.label}</p>
              <p className="text-3xl font-bold tracking-tight text-slate-800">{contagens[card.id] ?? 0}</p>
            </div>
            <span className={`p-3 rounded-2xl shrink-0 ${card.tone}`}>
              <Icon size={22} />
            </span>
          </div>
        </button>
      );
    })}
  </div>
);

export default PrazoSummaryCards;
