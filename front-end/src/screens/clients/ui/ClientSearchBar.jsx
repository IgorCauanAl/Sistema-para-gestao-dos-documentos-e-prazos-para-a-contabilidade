import React from 'react';
import { Search } from 'lucide-react';
import Card from '../../../core/components/Card';

const ClientSearchBar = ({ value, onChange }) => (
  <Card className="p-2">
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
      <input
        type="text"
        placeholder="Buscar por Razão Social ou CNPJ..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400"
      />
    </div>
  </Card>
);

export default ClientSearchBar;
