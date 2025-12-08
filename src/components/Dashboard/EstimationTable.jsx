import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function EstimationTable({ index, item, rows, onUpdateRows, calculateTotal, calculateQty }) {
  
  // --- HELPER: HIGHLIGHT ZERO/EMPTY CELLS IN TABLE ---
  const getTableZeroStyle = (val) => {
    const v = parseFloat(val);
    // If value is 0, empty, or NaN -> Red Warning Style
    if (!val || v === 0) return "bg-red-50 text-red-600 border border-red-200 font-bold placeholder-red-300";
    // Normal Style
    return "bg-gray-50 text-gray-800 border-transparent";
  };

  const addRow = () => { onUpdateRows([...rows, { id: Date.now() + Math.random(), desc: '', nos: 1, l: 0, b: 0, d: 0, unit: 'm3' }]); };
  const removeRow = (rowId) => { onUpdateRows(rows.filter(row => row.id !== rowId)); };
  const updateRow = (rowId, field, value) => { onUpdateRows(rows.map(row => row.id === rowId ? { ...row, [field]: value } : row)); };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2"><span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">{index + 1}</span> {item.title}</h3>
        <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">Total: <span className="text-blue-600 font-bold">{calculateTotal()}</span></div>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wider">
              <th className="text-left py-2 font-medium w-[35%] pl-2">Description</th>
              <th className="text-center py-2 font-medium w-[8%]">No</th>
              <th className="text-center py-2 font-medium w-[10%]">L</th>
              <th className="text-center py-2 font-medium w-[10%]">B</th>
              <th className="text-center py-2 font-medium w-[10%]">D</th>
              <th className="text-right py-2 font-medium w-[12%] pr-4">Qty</th>
              <th className="text-center py-2 font-medium w-[10%] bg-yellow-50 text-yellow-700 rounded-t">Unit</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => {
              if (row.isHeader) {
                  return (
                    <tr key={row.id} className="bg-gray-100">
                        <td colSpan={7} className="p-2 font-bold text-center text-gray-700 uppercase tracking-widest text-xs border-y border-gray-200">{row.desc}</td>
                        <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>
                  );
              }
              return (
                <tr key={row.id} className="group hover:bg-blue-50/20 transition-colors">
                  <td className="p-2"><textarea rows={1} className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded px-2 py-1 outline-none font-medium resize-none" placeholder="Description" value={row.desc} onChange={(e) => updateRow(row.id, 'desc', e.target.value)} /></td>
                  <td className="p-2"><input type="number" className="w-full text-center bg-gray-50 rounded px-1 py-1 outline-none" value={row.nos} onChange={(e) => updateRow(row.id, 'nos', e.target.value)} /></td>
                  
                  {/* Applied getTableZeroStyle to L, B, D inputs */}
                  <td className="p-2"><input type="number" className={`w-full text-center rounded px-1 py-1 outline-none border ${getTableZeroStyle(row.l)}`} value={row.l} onChange={(e) => updateRow(row.id, 'l', e.target.value)} /></td>
                  <td className="p-2"><input type="number" className={`w-full text-center rounded px-1 py-1 outline-none border ${getTableZeroStyle(row.b)}`} value={row.b} onChange={(e) => updateRow(row.id, 'b', e.target.value)} /></td>
                  <td className="p-2"><input type="number" className={`w-full text-center rounded px-1 py-1 outline-none border ${getTableZeroStyle(row.d)}`} value={row.d} onChange={(e) => updateRow(row.id, 'd', e.target.value)} /></td>
                  
                  <td className="p-2 text-right font-bold text-gray-700 pr-4">{row.unit === 'Hrs' || row.qtyOverride ? (<input type="number" className="w-full text-right bg-transparent font-bold text-blue-600 outline-none" defaultValue={calculateQty(row)} onChange={(e) => updateRow(row.id, 'qtyOverride', parseFloat(e.target.value))} />) : calculateQty(row)}</td>
                  <td className="p-2"><select className="w-full text-center bg-yellow-50 border border-yellow-100 text-yellow-800 rounded px-1 py-1 outline-none font-bold text-xs" value={row.unit} onChange={(e) => updateRow(row.id, 'unit', e.target.value)}><option value="m3">m³</option><option value="m2">m²</option><option value="m">m</option><option value="Hrs">Hrs</option><option value="Nos">Nos</option><option value="Kg">Kg</option></select></td>
                  <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button onClick={addRow} className="mt-3 text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded transition-colors"><Plus size={14} /> Add Row</button>
      </div>
    </div>
  );
}