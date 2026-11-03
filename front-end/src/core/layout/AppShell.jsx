import React from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const AppShell = ({ children }) => (
  <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden">
    <Sidebar />

    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
    </main>
  </div>
);

export default AppShell;
