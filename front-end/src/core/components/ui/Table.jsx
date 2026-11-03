import React from 'react';

const Table = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden ${className}`}>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export default Table;
