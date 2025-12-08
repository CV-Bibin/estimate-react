import React from 'react';
import { LayoutDashboard, Plus, Trash2 } from 'lucide-react';

export default function WallManager({ extLen, intLen, extWidth, intWidth, customWalls, updateState, addCustomWall, updateCustomWall, removeCustomWall }) {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm relative">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><LayoutDashboard size={16} /> Enclosed Walls</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Ext. Length (m)</label>
                <input type="number" className="w-full p-2 border-b border-slate-200 outline-none text-lg font-bold text-slate-800" value={extLen} onChange={(e) => updateState({extLen: e.target.value})} />
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>Width:</span>
                    <input type="number" className="w-16 p-1 border rounded text-center font-bold text-blue-600" value={extWidth} onChange={(e) => updateState({extWidth: e.target.value})} />
                </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Int. Length (m)</label>
                <input type="number" className="w-full p-2 border-b border-slate-200 outline-none text-lg font-bold text-slate-800" value={intLen} onChange={(e) => updateState({intLen: e.target.value})} />
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>Width:</span>
                    <input type="number" className="w-16 p-1 border rounded text-center font-bold text-green-600" value={intWidth} onChange={(e) => updateState({intWidth: e.target.value})} />
                </div>
            </div>
        </div>

        {customWalls.map((wall) => (
            <div key={wall.id} className="flex gap-2 mb-2 items-center bg-white p-2 rounded border border-gray-200">
                <input className="flex-1 p-1 text-xs border rounded" value={wall.name} onChange={(e) => updateCustomWall(wall.id, 'name', e.target.value)} />
                <div className="flex items-center gap-1"><span className="text-[10px] text-gray-400">L:</span><input type="number" className="w-14 p-1 text-xs border rounded text-center" value={wall.length} onChange={(e) => updateCustomWall(wall.id, 'length', e.target.value)} /></div>
                <div className="flex items-center gap-1"><span className="text-[10px] text-gray-400">W:</span><input type="number" className="w-12 p-1 text-xs border rounded text-center font-bold text-orange-600" value={wall.width} onChange={(e) => updateCustomWall(wall.id, 'width', e.target.value)} /></div>
                <button onClick={() => removeCustomWall(wall.id)} className="text-red-400"><Trash2 size={14} /></button>
            </div>
        ))}
        <button onClick={addCustomWall} className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2">+ Add Wall Type</button>
    </div>
  );
}