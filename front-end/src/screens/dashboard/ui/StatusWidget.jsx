import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Card from '../../../core/components/Card';

const StatusWidget = ({ data }) => (
  <Card className="col-span-1 flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-xl font-bold text-slate-800">Status Obrigações</h3>
      <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
        <ArrowUpRight size={20} className="text-slate-400" />
      </button>
    </div>

    <div className="p-4 bg-slate-50 rounded-2xl mb-6 flex justify-between items-center border border-slate-100">
      <span className="font-semibold text-slate-700">
        Novas Solicitações: <span className="text-indigo-600">{data.newRequests}</span>
      </span>
      <ArrowUpRight size={18} className="text-slate-400" />
    </div>

    <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
      {data.blocks.map((block) => (
        <div
          key={block.label}
          className={`${block.className} rounded-3xl p-4 flex flex-col justify-center items-center text-white shadow-sm hover:scale-[1.02] transition-transform cursor-pointer`}
        >
          <span className="text-3xl font-bold mb-1">{block.value}</span>
          <span className="text-xs font-medium text-center leading-tight opacity-90 whitespace-pre-line">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export default StatusWidget;
