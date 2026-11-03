import React from 'react';

export const DETAIL_TABS = ['Documentos', 'Solicitações', 'Prazos', 'Histórico'];

const DetailTabs = ({ activeTab, onChange }) => (
  <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-full gap-1 w-fit" role="tablist">
    {DETAIL_TABS.map((tab) => (
      <button
        key={tab}
        role="tab"
        aria-selected={activeTab === tab}
        onClick={() => onChange(tab)}
        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
          activeTab === tab
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default DetailTabs;
