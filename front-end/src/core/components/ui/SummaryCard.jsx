import React from 'react';
import Card from '../../../core/components/Card';

const SummaryCard = ({ title, value, subtext, trend, trendUp, icon: Icon, colorTheme }) => {
  const getColors = () => {
    switch (colorTheme) {
      case 'warning': return { text: 'text-orange-700', bg: 'bg-orange-50', icon: 'text-orange-600' };
      case 'danger': return { text: 'text-red-700', bg: 'bg-red-50', icon: 'text-red-600' };
      case 'success': return { text: 'text-green-700', bg: 'bg-green-50', icon: 'text-green-600' };
      default: return { text: 'text-slate-700', bg: 'bg-slate-50', icon: 'text-slate-600' };
    }
  };
  const theme = getColors();

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-end gap-3">
            <h4 className={`text-3xl font-bold tracking-tight ${theme.text}`}>{value}</h4>
            {trend && (
              <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md mb-1 ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${theme.bg}`}>
          <Icon size={24} className={theme.icon} />
        </div>
      </div>
      {subtext && <p className="text-xs text-slate-400 font-medium">{subtext}</p>}
    </Card>
  );
};

export default SummaryCard;
