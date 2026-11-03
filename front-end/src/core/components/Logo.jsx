import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2 text-indigo-500">
    <div className="relative flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-xl text-white">
      <FileSpreadsheet size={20} strokeWidth={2.5} />
      <div className="absolute inset-0 border-2 border-white/20 rounded-xl rounded-tr-none"></div>
    </div>
    <span className="text-xl font-bold text-slate-800 tracking-tight">Protótipo Visual</span>
  </div>
);

export default Logo;
