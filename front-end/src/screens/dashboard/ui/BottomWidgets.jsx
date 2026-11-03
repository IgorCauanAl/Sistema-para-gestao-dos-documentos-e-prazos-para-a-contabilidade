import React from 'react';
import { ArrowUpRight, Calendar, Download } from 'lucide-react';
import Card from '../../../core/components/Card';

const BottomWidgets = ({ clientProfile, documentsByType, weeklyDeliveries }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <Card title="Perfil de Clientes" action={<ArrowUpRight size={18} className="text-slate-400 cursor-pointer" />}>
      <div className="flex flex-col h-[220px] justify-between">
        <div className="space-y-4 mt-4">
          {clientProfile.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium text-slate-600">{item.type}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-800">{item.count}</span>
                <span className="text-xs font-medium text-slate-400 w-8 text-right">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>

    <Card title="Documentos por Tipo" action={<Calendar size={18} className="text-slate-400 cursor-pointer" />}>
      <div className="h-[220px] flex flex-col justify-end mt-4">
        <div className="flex justify-between items-end h-full px-2 gap-2">
          {documentsByType.map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              {bar.highlight && <span className="text-xs font-bold text-indigo-600 mb-1">{bar.val}</span>}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${bar.highlight ? 'bg-indigo-500 shadow-md shadow-indigo-200' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                style={{ height: bar.height }}
              ></div>
              <span className="text-xs font-medium text-slate-500">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>

    <Card title="Entregas na Semana" action={<Download size={18} className="text-slate-400 cursor-pointer" />}>
      <div className="mt-2">
        <div className="flex items-end gap-3 mb-6">
          <h4 className="text-3xl font-bold text-slate-800">{weeklyDeliveries.total}</h4>
          <span className="flex items-center text-xs font-semibold px-2 py-1 rounded-md mb-1 bg-green-100 text-green-700">
            ↑ {weeklyDeliveries.trend}
          </span>
        </div>

        <div className="h-24 w-full relative">
          <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path
              d="M 0,80 Q 50,70 100,50 T 200,60 T 300,20 T 400,10"
              fill="none"
              stroke="#6366F1"
              strokeWidth="3"
            />
            <path
              d="M 0,90 Q 50,85 100,70 T 200,80 T 300,40 T 400,50"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="300" cy="20" r="4" fill="white" stroke="#6366F1" strokeWidth="2" />
          </svg>
          <div className="absolute bottom-[-10px] w-full flex justify-between text-[10px] font-medium text-slate-400 px-1">
            {weeklyDeliveries.days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default BottomWidgets;
