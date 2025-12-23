import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Scissors, Shield, Trash2, Plus, Sun, Layout, CheckSquare, Square, ArrowDownRight, CopyPlus } from 'lucide-react';

export default function SlabParapetManager({
    plinthArea = 0,         
    plinthPerimeter = 0,    
    projectAreas = [],      
    openings = [],          
    slabData,               
    setSlabData,            
    evaluateMath            
}) {

    const [deductionsList, setDeductionsList] = useState([]);

    // --- 1. INITIALIZE & SYNC ---
    useEffect(() => {
        if (!slabData) {
            setSlabData({
                roofThickness: 0.12,
                overhangWidth: 0.60,
                
                // NEW: Array to hold multiple independent roof slabs
                extraSlabs: [], 

                miscSlabs: [],
                parapetWalls: [
                    { id: 1, name: "Main Roof Parapet", l: "", h: 0.9, thick: 0.10 }
                ] 
            });
        }
    }, []);

    // Sync deductions list with Project Setup data
    useEffect(() => {
        if (projectAreas.length > 0 && deductionsList.length === 0) {
            const initialList = projectAreas.map(item => {
                let shouldDeduct = false;
                // Auto-deduct logic
                if (item.hasRoof === false) shouldDeduct = true;
                else if ((item.name || "").toLowerCase().includes("open")) shouldDeduct = true;
                else if ((item.name || "").toLowerCase().includes("courtyard")) shouldDeduct = true;

                const val = parseFloat(item.floorArea || item.area || 0);

                return { 
                    id: item.id || Math.random(),
                    name: item.name || item.type, 
                    area: val, 
                    isDeducted: shouldDeduct,
                    originalRef: item // Keep ref to original data
                };
            });
            setDeductionsList(initialList);
        }
    }, [projectAreas]);

    if (!slabData) return null;

    // --- HANDLERS ---
    const updateField = (field, val) => setSlabData(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    
    const toggleDeduction = (id) => {
        setDeductionsList(prev => prev.map(d => d.id === id ? { ...d, isDeducted: !d.isDeducted } : d));
    };

    // --- NEW: EXTRA SLAB LOGIC ---
    
    // 1. Create a slab from a deducted area (e.g. Porch)
    const createSlabFromDeduction = (deductionItem) => {
        const newSlab = {
            id: Date.now(),
            name: `${deductionItem.name} Roof`,
            area: deductionItem.area,
            thickness: 0.10, // Default slightly thinner for porches
            overhang: 0.30,  // Smaller overhang for sub-roofs
            isManual: false  // Linked to an area
        };
        
        setSlabData(prev => ({
            ...prev,
            extraSlabs: [...(prev.extraSlabs || []), newSlab]
        }));
    };

    // 2. Create a purely manual slab (e.g. Stair room)
    const addManualSlab = () => {
        setSlabData(prev => ({
            ...prev,
            extraSlabs: [...(prev.extraSlabs || []), {
                id: Date.now(),
                name: "Stair Room / Mumty",
                area: 0,
                thickness: 0.12,
                overhang: 0.60,
                isManual: true
            }]
        }));
    };

    const updateExtraSlab = (id, field, val) => {
        setSlabData(prev => ({
            ...prev,
            extraSlabs: prev.extraSlabs.map(s => s.id === id ? { ...s, [field]: val } : s)
        }));
    };

    const removeExtraSlab = (id) => {
        setSlabData(prev => ({ ...prev, extraSlabs: prev.extraSlabs.filter(s => s.id !== id) }));
    };

    // --- EXISTING HANDLERS (Misc & Parapet) ---
    const addMiscSlab = (type, defaults = {}) => {
        setSlabData(prev => ({
            ...prev,
            miscSlabs: [...(prev.miscSlabs || []), { 
                id: Date.now() + Math.random(), 
                type, 
                l: defaults.l || 1.5, b: defaults.b || 0.6, nos: 1, thickness: 0.10 
            }]
        }));
    };
    const autoAddSunshadesFromOpenings = () => {
        const windows = openings.filter(o => (o.name || "").toUpperCase().startsWith('W') || (o.name || "").toUpperCase().startsWith('V'));
        if (windows.length === 0) { alert("No windows found."); return; }
        const newSlabs = windows.map(w => ({
            id: Date.now() + Math.random(), type: "Sunshade",
            l: (parseFloat(w.w || 0) + 0.3).toFixed(2), b: 0.6, nos: w.nos || 1, thickness: 0.10
        }));
        setSlabData(prev => ({ ...prev, miscSlabs: [...(prev.miscSlabs || []), ...newSlabs] }));
    };
    const updateMiscSlab = (id, field, val) => {
        setSlabData(prev => ({ ...prev, miscSlabs: (prev.miscSlabs || []).map(s => s.id === id ? { ...s, [field]: val } : s) }));
    };
    const removeMiscSlab = (id) => {
        setSlabData(prev => ({ ...prev, miscSlabs: (prev.miscSlabs || []).filter(s => s.id !== id) }));
    };
    const addParapetRow = () => {
        setSlabData(prev => ({ ...prev, parapetWalls: [...(prev.parapetWalls || []), { id: Date.now(), name: "Extra Parapet", l: "", h: 0.9, thick: 0.10 }] }));
    };
    const updateParapet = (id, field, val) => {
        setSlabData(prev => ({ ...prev, parapetWalls: (prev.parapetWalls || []).map(p => p.id === id ? { ...p, [field]: val } : p) }));
    };
    const removeParapet = (id) => {
        setSlabData(prev => ({ ...prev, parapetWalls: (prev.parapetWalls || []).filter(p => p.id !== id) }));
    };

    // --- CALCULATIONS ---

    // 1. Main Slab Volume
    const projectionArea = (plinthPerimeter * (parseFloat(slabData.overhangWidth) || 0));
    const totalDeductionArea = deductionsList.filter(d => d.isDeducted).reduce((acc, curr) => acc + (parseFloat(curr.area) || 0), 0);
    const netMainRoofArea = Math.max(0, (plinthArea + projectionArea) - totalDeductionArea);
    const mainRoofVol = netMainRoofArea * (parseFloat(slabData.roofThickness) || 0);

    // 2. Extra Slabs Volume
    const extraSlabsVol = (slabData.extraSlabs || []).reduce((acc, s) => {
        // Approx projection for extra slabs: Area + (sqrt(Area)*4 * overhang) - simplified logic
        // Better logic: Just User Input Area + Manual Overhang adjustment if needed.
        // For simplicity, we trust the "Area" input + we add a simple % for overhang if it's manual
        // If it's from a room, we assume 15% extra for overhang or let user edit area.
        const baseArea = parseFloat(s.area) || 0;
        // Simple overhang estimation for single rooms: (sqrt(Area) * 4) * overhang
        const perimeterEst = Math.sqrt(baseArea) * 4; 
        const ohArea = perimeterEst * (parseFloat(s.overhang) || 0);
        return acc + ((baseArea + ohArea) * (parseFloat(s.thickness) || 0));
    }, 0);

    // 3. Misc Slabs Volume
    const miscSlabVol = (slabData.miscSlabs || []).reduce((acc, s) => {
        return acc + (parseFloat(s.l) * parseFloat(s.b) * parseFloat(s.nos) * parseFloat(s.thickness));
    }, 0);

    // 4. Parapet
    const parapetVol = (slabData.parapetWalls || []).reduce((acc, p) => {
        const len = evaluateMath ? evaluateMath(p.l) : parseFloat(p.l) || 0;
        return acc + (len * parseFloat(p.h) * parseFloat(p.thick));
    }, 0);

    const roofPerimeterVal = (plinthPerimeter + (8 * (parseFloat(slabData.overhangWidth) || 0))).toFixed(2);
    const totalConcreteVol = mainRoofVol + extraSlabsVol + miscSlabVol;

    return (
        <div className="space-y-8 mt-6">
            
            {/* --- SECTION 1: ROOF SLABS (MAIN + EXTRA) --- */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-purple-100/50 p-4 border-b border-purple-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-purple-900">
                        <Layers size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Roof Slabs Configuration</h4>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-purple-600 font-bold uppercase">Total Slab Vol</div>
                        <div className="text-xl font-black text-purple-800 leading-none">{(mainRoofVol + extraSlabsVol).toFixed(2)} m³</div>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* A. MAIN SLAB CARD */}
                    <div className="bg-white rounded-xl border-2 border-purple-100 p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-1 rounded-br">MAIN SLAB</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <span className="text-xs font-bold text-gray-500">Base Plinth Area</span>
                                    <span className="text-lg font-bold text-gray-800">{plinthArea.toFixed(2)} m²</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">Overhang (m)</span>
                                    <input type="number" step="0.05" className="w-16 p-1 text-center font-bold border rounded bg-gray-50" value={slabData.overhangWidth} onChange={(e) => updateField('overhangWidth', e.target.value)} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">Thickness (m)</span>
                                    <input type="number" step="0.01" className="w-16 p-1 text-center font-bold border rounded bg-gray-50" value={slabData.roofThickness} onChange={(e) => updateField('roofThickness', e.target.value)} />
                                </div>
                            </div>

                            {/* DEDUCTIONS LIST */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Subtract Areas / Create Separate Roofs</div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {deductionsList.map((item) => {
                                        // Check if this deduction has already been converted to a slab
                                        const hasSlab = (slabData.extraSlabs || []).some(s => s.name.includes(item.name));
                                        
                                        return (
                                            <div key={item.id} className="flex flex-col gap-1 bg-white p-2 rounded border border-gray-100">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDeduction(item.id)}>
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.isDeducted ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'}`}>
                                                            {item.isDeducted && <CheckSquare size={10}/>}
                                                        </div>
                                                        <span className={`text-xs font-bold ${item.isDeducted ? 'text-red-700' : 'text-gray-600'}`}>{item.name} ({item.area} m²)</span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-gray-400">{item.isDeducted ? 'Deducted' : 'Included'}</span>
                                                </div>
                                                
                                                {/* MAGIC BUTTON: Create Separate Slab */}
                                                {item.isDeducted && !hasSlab && (
                                                    <button 
                                                        onClick={() => createSlabFromDeduction(item)}
                                                        className="flex items-center gap-1 text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 self-start ml-6 transition-colors"
                                                    >
                                                        <CopyPlus size={10}/> Create Separate Slab for {item.name}?
                                                    </button>
                                                )}
                                                {hasSlab && <div className="text-[9px] text-green-600 font-bold ml-6 flex items-center gap-1"><Shield size={10}/> Separate Slab Created</div>}
                                            </div>
                                        );
                                    })}
                                    {deductionsList.length === 0 && <div className="text-center text-xs text-gray-400 italic py-2">No open areas to deduct.</div>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right mt-3 pt-3 border-t border-purple-50">
                            <span className="text-xs font-bold text-purple-400 mr-2">Main Slab Net Vol:</span>
                            <span className="text-lg font-black text-purple-700">{mainRoofVol.toFixed(2)} m³</span>
                        </div>
                    </div>

                    {/* B. EXTRA SLABS LIST */}
                    {(slabData.extraSlabs || []).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                <ArrowDownRight size={14}/> Separate Roof Slabs
                            </div>
                            {(slabData.extraSlabs || []).map((slab) => (
                                <div key={slab.id} className="bg-white border-l-4 border-l-indigo-400 border border-gray-200 rounded p-3 flex flex-wrap gap-4 items-center shadow-sm">
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[9px] text-gray-400 uppercase font-bold">Slab Name</label>
                                        <input className="w-full text-xs font-bold text-indigo-900 border-b border-transparent focus:border-indigo-200 outline-none" value={slab.name} onChange={(e) => updateExtraSlab(slab.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-[9px] text-gray-400 uppercase font-bold">Area (m²)</label>
                                        <input type="number" className="w-full text-xs font-bold text-gray-700 bg-gray-50 p-1 rounded" value={slab.area} onChange={(e) => updateExtraSlab(slab.id, 'area', e.target.value)} />
                                    </div>
                                    <div className="w-16">
                                        <label className="text-[9px] text-gray-400 uppercase font-bold">Thk (m)</label>
                                        <input type="number" step="0.01" className="w-full text-xs font-bold text-center border p-1 rounded" value={slab.thickness} onChange={(e) => updateExtraSlab(slab.id, 'thickness', e.target.value)} />
                                    </div>
                                    <div className="w-16">
                                        <label className="text-[9px] text-gray-400 uppercase font-bold">Overhang</label>
                                        <input type="number" step="0.05" className="w-full text-xs font-bold text-center border p-1 rounded" value={slab.overhang} onChange={(e) => updateExtraSlab(slab.id, 'overhang', e.target.value)} />
                                    </div>
                                    <button onClick={() => removeExtraSlab(slab.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={addManualSlab} className="w-full py-2 bg-indigo-50 border border-dashed border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                        <Plus size={14}/> Add Another Independent Slab (Stair Room, etc.)
                    </button>
                </div>
            </div>

            {/* --- SECTION 2: INTERIOR & MISC SLABS (ORANGE) --- */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-orange-100/50 p-4 border-b border-orange-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-orange-900">
                        <Sun size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Sunshades & Misc Slabs</h4>
                    </div>
                    <div className="text-right">
                         <div className="text-[10px] text-orange-600 font-bold uppercase">Volume</div>
                        <div className="text-xl font-black text-orange-800 leading-none">{miscSlabVol.toFixed(3)} m³</div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={autoAddSunshadesFromOpenings} className="py-2 bg-orange-100 border border-orange-300 text-orange-800 rounded text-[10px] font-bold hover:bg-orange-200 flex items-center justify-center gap-1">
                            <Sun size={12}/> Auto-Add Sunshades (Windows)
                        </button>
                    </div>

                    <div className="flex gap-2 border-b border-orange-200 pb-3 mb-3">
                        <button onClick={() => addMiscSlab('Sunshade')} className="flex-1 py-1.5 bg-white border border-orange-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">+ Sunshade</button>
                        <button onClick={() => addMiscSlab('Kitchen')} className="flex-1 py-1.5 bg-white border border-orange-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">+ Kitchen Slab</button>
                        <button onClick={() => addMiscSlab('Loft')} className="flex-1 py-1.5 bg-white border border-orange-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">+ Loft/Shelf</button>
                    </div>

                    <div className="space-y-2">
                        {(slabData.miscSlabs || []).map((slab, i) => (
                            <div key={slab.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-orange-100 shadow-sm">
                                <div className="col-span-3">
                                    <select 
                                        value={slab.type} 
                                        onChange={(e) => updateMiscSlab(slab.id, 'type', e.target.value)}
                                        className="w-full text-[10px] font-bold text-gray-700 border-none bg-transparent focus:ring-0"
                                    >
                                        <option value="Sunshade">Sunshade</option>
                                        <option value="Kitchen">Kitchen Top</option>
                                        <option value="Loft">Loft/Shelf</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <input type="number" placeholder="L" className="w-full p-1 text-xs border rounded bg-gray-50 text-center" value={slab.l} onChange={(e) => updateMiscSlab(slab.id, 'l', e.target.value)}/>
                                </div>
                                <div className="col-span-2">
                                    <input type="number" placeholder="W" className="w-full p-1 text-xs border rounded bg-gray-50 text-center" value={slab.b} onChange={(e) => updateMiscSlab(slab.id, 'b', e.target.value)}/>
                                </div>
                                <div className="col-span-2 flex items-center gap-1">
                                    <span className="text-[9px] text-gray-400">x</span>
                                    <input type="number" placeholder="No" className="w-full p-1 text-xs border rounded bg-gray-50 text-center" value={slab.nos} onChange={(e) => updateMiscSlab(slab.id, 'nos', e.target.value)}/>
                                </div>
                                <div className="col-span-2 flex items-center gap-1">
                                    <span className="text-[9px] text-gray-400">Thk</span>
                                    <input type="number" step="0.01" className="w-full p-1 text-xs border rounded bg-gray-50 text-center" value={slab.thickness} onChange={(e) => updateMiscSlab(slab.id, 'thickness', e.target.value)}/>
                                </div>
                                <div className="col-span-1 text-right">
                                    <button onClick={() => removeMiscSlab(slab.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: PARAPET WALL (SLATE) --- */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100/50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Shield size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Parapet Wall Protection</h4>
                    </div>
                    <div className="text-right">
                         <div className="text-[10px] text-slate-500 font-bold uppercase">Brick Volume</div>
                        <div className="text-xl font-black text-slate-700 leading-none">{parapetVol.toFixed(3)} m³</div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-xs text-gray-500">
                        <span>Suggested Perimeter (Plinth + Overhang):</span>
                        <span className="font-mono font-bold text-slate-700">{roofPerimeterVal} m</span>
                    </div>

                    <div className="space-y-2">
                        {(slabData.parapetWalls || []).map((p, index) => (
                            <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200">
                                <div className="col-span-4">
                                    <input 
                                        className="w-full p-1 text-xs border-none font-bold text-slate-700 bg-transparent focus:ring-0" 
                                        value={p.name} 
                                        onChange={(e) => updateParapet(p.id, 'name', e.target.value)}
                                        placeholder="Wall Name"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="text" 
                                        className="w-full p-1 text-xs border rounded bg-slate-50 text-center font-mono" 
                                        value={p.l} 
                                        onChange={(e) => updateParapet(p.id, 'l', e.target.value)}
                                        placeholder={index === 0 ? "Length" : "0"}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input type="number" step="0.1" className="w-full p-1 text-xs border rounded text-center" value={p.h} onChange={(e) => updateParapet(p.id, 'h', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <input type="number" step="0.01" className="w-full p-1 text-xs border rounded text-center" value={p.thick} onChange={(e) => updateParapet(p.id, 'thick', e.target.value)} />
                                </div>
                                <div className="col-span-1 text-right">
                                    <button onClick={() => removeParapet(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addParapetRow} className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1">
                        <Plus size={12} /> Add Parapet Segment
                    </button>
                </div>
            </div>

        </div>
    );
}