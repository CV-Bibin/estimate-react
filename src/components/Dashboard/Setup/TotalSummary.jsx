import React from 'react';
import { Calculator } from 'lucide-react';

export default function TotalSummary({ totalLinearLength }) {
  return (
    <div className="bg-slate-800 text-white p-3 rounded-xl flex justify-between items-center shadow-md border-t-4 border-yellow-400">
        <span className="text-xs font-bold flex items-center gap-2 text-slate-300">
            <Calculator size={14}/> Total Foundation Length
        </span>
        <span className="text-lg font-mono font-bold text-yellow-400">
            {totalLinearLength} m
        </span>
    </div>
  );
}