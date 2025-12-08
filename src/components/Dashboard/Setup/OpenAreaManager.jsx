import React from 'react';
import { Sun, Plus, Trash2 } from 'lucide-react';

export default function OpenAreaManager({ openAreas, addOpenArea, updateOpenArea, removeOpenArea }) {
  return (
    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm relative">
        <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4"><Sun size={16} /> Open Areas / Courtyards</h4>
        <div className="space-y-2 mb-4">
            {openAreas.map((area) => (
                <div key={area.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-orange-200 shadow-sm">
                    <select className="flex-1 p-2 text-xs font-bold text-gray-700 bg-transparent outline-none cursor-pointer" value={area.type} onChange={(e) => updateOpenArea(area.id, 'type', e.target.value)}>
                        <option value="Sit-out">Sit-out</option><option value="Verandah">Verandah</option><option value="Open Area">Open Area</option><option value="Courtyard">Courtyard</option><option value="Car Porch">Car Porch</option><option value="Work Area">Work Area</option>
                    </select>
                    <div className="flex items-center gap-2 border-l border-orange-100 pl-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Perim.</label>
                        <input type="number" className="w-20 p-1 bg-orange-50 border border-orange-200 rounded text-center text-xs font-bold text-orange-800" value={area.perimeter} onChange={(e) => updateOpenArea(area.id, 'perimeter', e.target.value)} />
                        <button onClick={() => removeOpenArea(area.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={addOpenArea} className="w-full py-2 border border-dashed border-orange-300 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-50 flex items-center justify-center gap-1"><Plus size={12} /> Add Open Area</button>
    </div>
  );
}