import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import Card from '../../../core/components/Card';

const MainChartWidget = ({ data }) => (
  <Card className="col-span-1 lg:col-span-2 relative overflow-hidden">
    <div className="flex justify-between items-center mb-8 relative z-10">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Fluxo de Documentos</h3>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-sm text-slate-500 font-medium">Enviados (Contabilidade)</p>
            <p className="text-2xl font-bold text-slate-800">{data.sent}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Recebidos (Clientes)</p>
            <p className="text-2xl font-bold text-slate-800">{data.received}</p>
          </div>
        </div>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-colors border border-slate-200">
        <Settings size={16} /> Mensal <ChevronDown size={16} />
      </button>
    </div>

    <div className="h-48 w-full mt-4 relative">
      <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient-enviados" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
          <pattern id="diagonal-stripe" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M-5,25 L25,-5" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#diagonal-stripe)" />

        <path
          d="M 0,150 Q 100,140 200,100 T 400,60 T 600,80 T 800,20"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeDasharray="6 6"
        />

        <path
          d="M 0,180 Q 100,160 200,130 T 400,150 T 600,120 T 800,90"
          fill="none"
          stroke="#6366F1"
          strokeWidth="4"
        />

        <path
          d="M 0,180 Q 100,160 200,130 T 400,150 T 600,120 T 800,90 L 800,200 L 0,200 Z"
          fill="url(#gradient-enviados)"
        />

        <circle cx="600" cy="120" r="6" fill="white" stroke="#6366F1" strokeWidth="3" />
      </svg>

      <div className="absolute top-6 right-[20%] bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-2 z-20">
        <p className="text-xs text-slate-400 font-medium mb-1">{data.tooltip.date}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Recebidos
          </span>
          <span className="text-sm font-bold">{data.tooltip.received}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Enviados
          </span>
          <span className="text-sm font-bold">{data.tooltip.sent}</span>
        </div>
      </div>

      <div className="absolute bottom-0 w-full flex justify-between text-xs font-medium text-slate-400 px-2">
        {data.months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  </Card>
);

export default MainChartWidget;
