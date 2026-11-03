import React from 'react';

const Timeline = ({ items }) => (
  <ol className="relative">
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      const done = item.done;

      return (
        <li key={item.title} className="relative pl-8 pb-6 last:pb-0">
          {!isLast && (
            <span
              className={`absolute left-[7px] top-4 bottom-0 w-px ${done ? 'bg-indigo-300' : 'bg-slate-200'}`}
              aria-hidden="true"
            />
          )}

          <span
            className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
              done ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'
            }`}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-0.5">
            <span className={`text-sm font-semibold ${done ? 'text-slate-700' : 'text-slate-400'}`}>
              {item.title}
            </span>

            {done ? (
              <span className="text-xs text-slate-500">
                {item.date} às {item.time}
                {item.extra && <span className="text-slate-400"> · {item.extra}</span>}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">aguardando</span>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

export default Timeline;
