import React from 'react';
import { Building2, Layers, Trash2, Info } from 'lucide-react';

export default function StructuralSpecs({ 
    foundationType, numFloors, columnGroups, totalCols, isRCC, isRR,
    updateState, handleFloorCountChange, applyAutoSizes, 
    addColumnGroup, updateGroup, removeGroup 
}) {
  return (
    <div className="space-y-6">
        {/* Floors & Foundation */}
        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-4"><Building2 size={16} /> Foundation & Floors</h4>
            <select className="w-full p-3 bg-white border border-indigo-100 rounded-xl font-bold text-indigo-700 mb-4" value={foundationType} onChange={(e) => updateState({foundationType: e.target.value, columnGroups: []})}>
                <option value="RR">RR Masonry (Load Bearing)</option>
                <option value="RCC">RCC Column Structure</option>
            </select>
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-indigo-900">Floors:</label>
                <input type="number" min="1" max="10" className="w-16 p-2 border rounded font-bold text-center" value={numFloors} onChange={(e) => handleFloorCountChange(e.target.value)} />
            </div>
        </div>

        {/* Columns */}
        <div className="p-6 rounded-2xl border shadow-sm bg-green-50/50 border-green-100 h-full">
            <div className="flex justify-between mb-4">
                <h4 className="text-sm font-bold text-green-900"><Layers size={16} className="inline mr-2"/> Columns & Footings</h4>
                <span className="text-xs bg-white px-2 py-1 rounded font-bold">Total: {totalCols}</span>
            </div>
            
            <div className="mb-3 flex items-center gap-2 text-[10px] text-gray-500 bg-white p-2 rounded border border-dashed">
                <Info size={14} className="text-blue-500"/> 
                <div>
                    <div><b>G+0:</b> Footing 1.0x1.0, Depth 1.2, Col 23x23cm</div>
                    <div><b>G+1:</b> Footing 1.2x1.2, Depth 1.5, Col 23x30cm</div>
                </div>
            </div>

            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
                {columnGroups.map(grp => (
                    <div key={grp.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-2">
                            <input className="text-xs font-bold text-blue-800 w-full outline-none border-b border-transparent focus:border-blue-300" value={grp.name} onChange={(e)=>updateGroup(grp.id,'name',e.target.value)} />
                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600">x <input type="number" className="w-8 bg-transparent text-center outline-none" value={grp.count} onChange={(e)=>updateGroup(grp.id,'count',e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-blue-50 p-1.5 rounded text-center border border-blue-100"><div className="text-blue-400 font-bold mb-1 uppercase">Footing (L x B x D)</div><div className="flex gap-1 justify-center items-center"><input className="w-8 text-center bg-transparent border-b border-blue-300 font-bold" value={grp.f_l} onChange={(e)=>updateGroup(grp.id,'f_l',e.target.value)} />x<input className="w-8 text-center bg-transparent border-b border-blue-300 font-bold" value={grp.f_b} onChange={(e)=>updateGroup(grp.id,'f_b',e.target.value)} />x<input className="w-8 text-center bg-transparent border-b border-blue-300 font-bold" value={grp.f_d} onChange={(e)=>updateGroup(grp.id,'f_d',e.target.value)} /></div></div>
                            <div className="bg-green-50 p-1.5 rounded text-center border border-green-100"><div className="text-green-600 font-bold mb-1 uppercase">Column (L x B)</div><div className="flex gap-1 justify-center items-center"><input className="w-8 text-center bg-transparent border-b border-green-300 font-bold" value={grp.c_l} onChange={(e)=>updateGroup(grp.id,'c_l',e.target.value)} />x<input className="w-8 text-center bg-transparent border-b border-green-300 font-bold" value={grp.c_b} onChange={(e)=>updateGroup(grp.id,'c_b',e.target.value)} /></div></div>
                        </div>
                        <button onClick={() => removeGroup(grp.id)} className="absolute -top-2 -right-2 bg-white text-red-400 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"><Trash2 size={12} /></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                {isRCC && <button onClick={()=>addColumnGroup('Concealed')} className="flex-1 py-2 bg-white border border-green-200 text-green-700 rounded text-xs font-bold">+ Main Col</button>}
                <button onClick={()=>addColumnGroup('Open')} className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded text-xs font-bold">+ {isRR ? 'Sit-out Col' : 'Open Col (RCC)'}</button>
            </div>
        </div>
    </div>
  );
}