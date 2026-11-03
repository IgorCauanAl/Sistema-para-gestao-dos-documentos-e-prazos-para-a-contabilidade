import React from 'react';

const ProgressBar = ({ pct, className = '', tone = 'indigo' }) => (
  <div
    className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden ${className}`}
    role="progressbar"
    aria-valuenow={pct}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className={`h-full rounded-full transition-all duration-500 ${tone === 'green' ? 'bg-green-600' : 'bg-indigo-500'}`}
      style={{ width: `${pct}%` }}
    />
  </div>
);

export default ProgressBar;
