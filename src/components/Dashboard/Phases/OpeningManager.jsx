import React, { useMemo } from 'react';
import { Plus, Trash2, DoorOpen, LayoutGrid } from 'lucide-react';

export default function OpeningManager({ 
    floorName, 
    openings = [], 
    setOpenings, 
    wallOptions = [0.23, 0.15, 0.10] 
}) {
    
    // --- 1. CALCULATIONS & STATS ---
    const stats = useMemo(() => {
        let area = 0;
        let volume = 0;
        let length = 0; // Total width of openings (useful for lintels)
        const counts = { Doors: 0, Windows: 0, Ventilators: 0, Arch: 0, Rectangular: 0, Grill: 0 };

        openings.forEach(o => {
            const w = parseFloat(o.width) || 0;
            const h = parseFloat(o.height) || 0;
            const wall = parseFloat(o.wallSize) || 0;
            const nos = parseFloat(o.nos) || 0;
            const type = o.type || 'Door';

            // Totals
            const itemArea = w * h * nos;
            const itemVol = w * h * wall * nos;
            const itemLen = w * nos;

            area += itemArea;
            volume += itemVol;
            length += itemLen;

            // Counts
            if (type === 'Door') counts.Doors += nos;
            else if (type === 'Window') counts.Windows += nos;
            else if (type === 'Ventilator') counts.Ventilators += nos;
            else if (type === 'Arch') counts.Arch += nos;
            else if (type === 'Opening') counts.Rectangular += nos;
            else counts.Grill += nos;
        });

        return { area, volume, length, counts };
    }, [openings]);

    // --- 2. HANDLERS ---
    const handleAdd = () => {
        const newOpening = {
            id: Date.now() + Math.random(),
            type: 'Door',
            width: '1.0',
            height: '2.1',
            nos: '1',
            wallSize: wallOptions.length > 0 ? wallOptions[0] : 0.23
        };
        setOpenings([...openings, newOpening]);
    };

    const handleChange = (id, field, value) => {
        const updated = openings.map(o => {
            if (o.id === id) {
                if (field === 'wallSize') return { ...o, [field]: parseFloat(value) || 0 };
                return { ...o, [field]: value };
            }
            return o;
        });
        setOpenings(updated);
    };

    const handleRemove = (id) => {
        setOpenings(openings.filter(o => o.id !== id));
    };

    // --- 3. RENDER ---
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
            
            {/* Header Section */}
            <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <DoorOpen size={16}/> Doors, Windows & Openings ({floorName})
                </h4>

                {/* Summary Counts Bar */}
                <div className="bg-gray-50 rounded-lg p-2 flex flex-wrap gap-4 text-[10px] uppercase font-bold text-gray-500 border border-gray-200">
                    <span>Doors: <span className="text-blue-600 text-sm">{stats.counts.Doors}</span></span>
                    <span className="text-gray-300">|</span>
                    <span>Windows: <span className="text-blue-600 text-sm">{stats.counts.Windows}</span></span>
                    <span className="text-gray-300">|</span>
                    <span>Ventilators: <span className="text-blue-600 text-sm">{stats.counts.Ventilators}</span></span>
                    <span className="text-gray-300">|</span>
                    <span>Arch: <span className="text-blue-600 text-sm">{stats.counts.Arch}</span></span>
                    <span className="text-gray-300">|</span>
                    <span>Rectangular: <span className="text-blue-600 text-sm">{stats.counts.Rectangular}</span></span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2 text-center">Width (m)</div>
                    <div className="col-span-2 text-center">Height (m)</div>
                    <div className="col-span-1 text-center">Nos</div>
                    <div className="col-span-3">Wall Size</div>
                    <div className="col-span-1 text-right">Area</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Input Rows */}
                {openings.map(item => {
                    const rowArea = (parseFloat(item.width || 0) * parseFloat(item.height || 0) * parseFloat(item.nos || 0)).toFixed(2);
                    return (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            {/* Type */}
                            <div className="col-span-2">
                                <select 
                                    className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                                    value={item.type}
                                    onChange={(e) => handleChange(item.id, 'type', e.target.value)}
                                >
                                    <option value="Door">Door</option>
                                    <option value="Window">Window</option>
                                    <option value="Ventilator">Ventilator</option>
                                    <option value="Arch">Arch</option>
                                    <option value="Opening">Rectangular</option>
                                    <option value="Grill">Grill</option>
                                </select>
                            </div>

                            {/* Dimensions */}
                            <div className="col-span-2">
                                <input type="number" step="0.01" className="w-full p-1.5 text-xs border border-gray-300 rounded text-center font-bold"
                                    value={item.width} onChange={(e) => handleChange(item.id, 'width', e.target.value)} placeholder="W" />
                            </div>
                            <div className="col-span-2">
                                <input type="number" step="0.01" className="w-full p-1.5 text-xs border border-gray-300 rounded text-center"
                                    value={item.height} onChange={(e) => handleChange(item.id, 'height', e.target.value)} placeholder="H" />
                            </div>
                            <div className="col-span-1">
                                <input type="number" step="1" className="w-full p-1.5 text-xs border border-gray-300 rounded text-center bg-yellow-50 font-bold text-gray-800"
                                    value={item.nos} onChange={(e) => handleChange(item.id, 'nos', e.target.value)} />
                            </div>

                            {/* Wall Size */}
                            <div className="col-span-3">
                                <select className="w-full p-1.5 text-xs border border-gray-300 rounded bg-gray-50"
                                    value={item.wallSize} onChange={(e) => handleChange(item.id, 'wallSize', e.target.value)}>
                                    {wallOptions.map((w, i) => <option key={i} value={w}>{w} m</option>)}
                                    {!wallOptions.includes(parseFloat(item.wallSize)) && <option value={item.wallSize}>{item.wallSize} m</option>}
                                </select>
                            </div>

                            {/* Row Area Display */}
                            <div className="col-span-1 text-right text-xs font-bold text-gray-600">
                                {rowArea}
                            </div>

                            {/* Delete */}
                            <div className="col-span-1 flex justify-end">
                                <button onClick={() => handleRemove(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {openings.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                        No openings added yet. Click below to add.
                    </div>
                )}

                {/* Footer Totals */}
                <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                    <div className="space-x-4">
                         <span className="font-bold text-gray-600">Total Opening Area: <span className="text-red-500">{stats.area.toFixed(2)} m²</span></span>
                         <span className="text-gray-300">|</span>
                         <span className="font-bold text-gray-600">Total Opening Volume: <span className="text-red-500">{stats.volume.toFixed(3)} m³</span></span>
                    </div>
                </div>

                {/* Add Button */}
                <button 
                    onClick={handleAdd}
                    className="w-full py-2.5 mt-2 border border-dashed border-blue-300 text-blue-600 text-xs font-bold rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={14}/> Add New Group
                </button>
            </div>
        </div>
    );
}