import React from 'react';

export const Table = ({ columns = [], data = [] }) => {
  // 🛡 SAFETY GUARD
  if (!columns.length) {
    return <div className="p-8 text-center text-slate-400 text-sm">No columns defined</div>;
  }

  return (
    <div className="saas-table-container overflow-x-auto w-full">
      <table className="saas-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0 border-b border-slate-100 z-10"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-12 text-center text-slate-400 text-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <span className="text-xl">∅</span>
                  </div>
                  <p className="font-semibold text-slate-500">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors duration-200">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 text-sm text-slate-600 border-b border-slate-100/50"
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
