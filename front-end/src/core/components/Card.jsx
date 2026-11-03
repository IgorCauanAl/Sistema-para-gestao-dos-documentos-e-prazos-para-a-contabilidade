import React from 'react';

const Card = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/50 p-6 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-semibold text-slate-700">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Card;
