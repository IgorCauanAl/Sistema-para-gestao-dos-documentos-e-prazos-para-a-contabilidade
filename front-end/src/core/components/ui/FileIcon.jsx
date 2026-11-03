import React from 'react';
import { FileText, FileSpreadsheet, FileCode } from 'lucide-react';

const meta = {
  pdf: { icon: FileText, className: 'bg-red-50 text-red-500' },
  xlsx: { icon: FileSpreadsheet, className: 'bg-green-50 text-green-600' },
  csv: { icon: FileSpreadsheet, className: 'bg-green-50 text-green-600' },
  xml: { icon: FileCode, className: 'bg-amber-50 text-amber-600' },
  ofx: { icon: FileCode, className: 'bg-blue-50 text-blue-600' },
  txt: { icon: FileText, className: 'bg-slate-100 text-slate-500' },
};

const FileIcon = ({ formato, size = 18 }) => {
  const { icon: Icon, className } = meta[formato] ?? meta.txt;

  return (
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${className}`}>
      <Icon size={size} />
    </span>
  );
};

export default FileIcon;
