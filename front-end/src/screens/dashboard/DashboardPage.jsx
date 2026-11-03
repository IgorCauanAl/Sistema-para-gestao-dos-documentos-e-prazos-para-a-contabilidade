import React, { useEffect, useState } from 'react';
import { Building2, Calendar, ChevronDown } from 'lucide-react';
import { mockDashboardAdapter } from './adapters/mockDashboardAdapter';
import SummaryCard from '../../core/components/ui/SummaryCard';
import MainChartWidget from './ui/MainChartWidget';
import StatusWidget from './ui/StatusWidget';
import BottomWidgets from './ui/BottomWidgets';

const DashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      mockDashboardAdapter.getSummaryCards(),
      mockDashboardAdapter.getDocumentFlow(),
      mockDashboardAdapter.getObligationsStatus(),
      mockDashboardAdapter.getClientProfile(),
      mockDashboardAdapter.getDocumentsByType(),
      mockDashboardAdapter.getWeeklyDeliveries(),
    ]).then(([summaryCards, documentFlow, obligationsStatus, clientProfile, documentsByType, weeklyDeliveries]) => {
      if (mounted) {
        setData({ summaryCards, documentFlow, obligationsStatus, clientProfile, documentsByType, weeklyDeliveries });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h1>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Building2 size={16} /> Todos os Clientes <ChevronDown size={16} className="ml-1" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={16} /> Este Mês <ChevronDown size={16} className="ml-1" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <MainChartWidget data={data.documentFlow} />
        <StatusWidget data={data.obligationsStatus} />
      </div>

      <BottomWidgets
        clientProfile={data.clientProfile}
        documentsByType={data.documentsByType}
        weeklyDeliveries={data.weeklyDeliveries}
      />

      <div className="h-8"></div>
    </div>
  );
};

export default DashboardPage;
