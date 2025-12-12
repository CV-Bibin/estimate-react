import React, { useState, useEffect, useMemo } from 'react';
// FIX: Added 'Trash2' to the imports below
import { Maximize2, Ruler, BrickWall, Calculator, ArrowDown, ArrowUp, Grid, Home, Save, Trash2 } from 'lucide-react';
import OpeningManager from './OpeningManager';
import BeamLintelManager from './BeamLintelManager';

export default function PlinthDataInput({ 
    floorName, 
    initialData = {}, 
    initialExt, 
    initialInt, 
    projectCustomWalls = [], 
    projectOpenAreas = [], 
    onSave 
}) {
    // --- SAFEGUARDS ---
    const handleMathInput = (val) => val ? String(val).replace(/[^0-9+\-*/. ]/g, '') : ''; 
    
    // Robust Math Evaluator that never throws
    const evaluateMath = (val) => {
        try {
            if (val === undefined || val === null || val === '') return 0;
            // Prevent Object/Array to string conversion issues
            if (typeof val === 'object') return 0; 
            const cleanVal = String(val).replace(/[^0-9+\-*/. ]/g, ''); 
            if (!cleanVal) return 0;
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + cleanVal)(); 
            return parseFloat(result) || 0;
        } catch (e) { return 0; }
    };

    const safeNum = (n) => {
        const parsed = parseFloat(n);
        return isNaN(parsed) ? 0 : parsed;
    };
    
    const safeFloat = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "0.00";
        return num.toFixed(2);
    };

    const isGroundFloor = floorName ? floorName.toLowerCase().includes('ground') : false;

    // --- 1. STATE INITIALIZATION ---
    const [data, setData] = useState(() => {
        const initialCustomWalls = initialData.customWalls || (isGroundFloor ? projectCustomWalls.map(w => ({
            id: w.id, name: w.name, l: w.length, b: w.width, h: 3.0, isPlinthExempt: w.isPlinthExempt
        })) : []);

        let initialOpenAreaBeams = initialData.openAreaBeams || [];
        if (initialOpenAreaBeams.length === 0 && projectOpenAreas.length > 0 && isGroundFloor) {
            initialOpenAreaBeams = projectOpenAreas.map(oa => {
                const isCourtyard = oa.type === 'Courtyard';
                const defaultLen = isCourtyard ? `${oa.touchingLen}+${oa.freeLen}` : oa.freeLen;
                return {
                    id: oa.id, name: oa.type, 
                    details: `Touching: ${evaluateMath(oa.touchingLen).toFixed(2)}m, Free: ${evaluateMath(oa.freeLen).toFixed(2)}m`,
                    l: defaultLen, b: 0.23, d: 0.45, heightFromFloor: 3.0
                };
            });
        }

        return {
            plinthArea: initialData.plinthArea || '',
            plinthPerimeter: initialData.plinthPerimeter || '', 
            deductionVol: initialData.deductionVol || '',       
            deductionCols: initialData.deductionCols || '',     
            deductionArea: initialData.deductionArea || '',
            deductionCarpet: initialData.deductionCarpet || '',
            extWall: initialData.extWall || { l: initialExt?.l || 0, b: initialExt?.b || 0.23, h: 3.0 },
            intWall: initialData.intWall || { l: initialInt?.l || 0, b: initialInt?.b || 0.23, h: 3.0 },
            
            // Explicit Array Initialization to prevent mapping over undefined
            customWalls: Array.isArray(initialCustomWalls) ? initialCustomWalls : [],
            irregularWalls: Array.isArray(initialData.irregularWalls) ? initialData.irregularWalls : [],
            openings: Array.isArray(initialData.openings) ? initialData.openings : [],
            openAreaBeams: Array.isArray(initialOpenAreaBeams) ? initialOpenAreaBeams : [],
            mainBeams: initialData.mainBeams || { concealed: [], drop: [] },
            lintels: initialData.lintels || { deductions: [], thickness: 0.15 } 
        };
    });
    
    const [stats, setStats] = useState({
        scheduleVol: 0, scheduleArea: 0, totalWallLen: 0,
        adjustVol: 0, adjustArea: 0,
        grossVol: 0, openVol: 0, netVol: 0,
        grossArea: 0, openAreaDed: 0, netArea: 0,
        plinthA: 0, footprint: 0, netCarpet: 0,
        grossLintelVol: 0,
        lintelVol: 0, 
        beamVolConcealed: 0, beamVolDrop: 0, beamVolOpen: 0, beamVolTotal: 0, concreteVolume: 0
    });

    useEffect(() => { }, [floorName]);

    // --- 2. CALCULATED DERIVED VALUES (Memoized for Safety) ---
    // This prevents crash if a wall has no width defined yet
    const availableWallWidths = useMemo(() => {
        const widths = new Set();
        // Add Base Walls safely
        if (data.extWall?.b) widths.add(parseFloat(data.extWall.b) || 0.23);
        if (data.intWall?.b) widths.add(parseFloat(data.intWall.b) || 0.23);
        
        // Add Custom Walls safely
        if (Array.isArray(data.customWalls)) {
            data.customWalls.forEach(w => {
                if (w && w.b) widths.add(parseFloat(w.b) || 0);
            });
        }
        
        // Add Irregular Walls safely
        if (Array.isArray(data.irregularWalls)) {
            data.irregularWalls.forEach(w => {
                if (w && w.b) widths.add(parseFloat(w.b) || 0);
            });
        }
        
        return [...widths].sort((a, b) => b - a);
    }, [data.extWall, data.intWall, data.customWalls, data.irregularWalls]);


    // --- 3. MAIN CALCULATIONS ---
    useEffect(() => {
        const val = (v) => evaluateMath(v); 

        // 1. WALLS
        let scheduleVol = 0; let scheduleArea = 0; let footprint = 0; let totalLen = 0; 
        let totalLintelVol = 0;
        
        const processWall = (w, isExempt) => {
            if (!w) return; // Skip invalid entries
            const l = val(w.l); const b = val(w.b); const h = val(w.h);
            const v = l * b * h; 
            const a = l * h * 2;
            totalLen += l; scheduleVol += v; scheduleArea += a;
            if (!isExempt) footprint += (l * b);
            totalLintelVol += (l * b * 0.15); 
        };

        if(data.extWall) processWall(data.extWall, false);
        if(data.intWall) processWall(data.intWall, false);
        if(Array.isArray(data.customWalls)) data.customWalls.forEach(w => processWall(w, w.isPlinthExempt));

        // 2. ADJUSTMENTS (Protected Loop)
        let adjustVol = 0; let adjustArea = 0;
        if(Array.isArray(data.irregularWalls)) {
            data.irregularWalls.forEach(w => {
                if (!w) return; // Skip invalid entries
                const l = val(w.l); const b = val(w.b); const h = val(w.h);
                if (w.mode === 'deduct') { 
                    adjustVol -= (l*b*h); adjustArea -= (l*h*2); 
                } else { 
                    adjustVol += (l*b*h); adjustArea += (l*h*2); totalLen += l; 
                    if(w.mode === 'add') footprint += (l * b); 
                    totalLintelVol += (l * b * 0.15);
                }
            });
        }
        
        // 3. LINTELS
        let manualLintelDeductVol = 0;
        if (data.lintels && Array.isArray(data.lintels.deductions)) {
            data.lintels.deductions.forEach(d => {
                if (d) manualLintelDeductVol += (val(d.l) * parseFloat(d.b || 0.23) * 0.15);
            });
        }
        const netLintelVol = Math.max(0, totalLintelVol - manualLintelDeductVol); 
        
        // 4. BEAMS
        let volOpen = 0; let volConcealed = 0; let volDrop = 0;
        if(Array.isArray(data.openAreaBeams)) data.openAreaBeams.forEach(b => { if(b) volOpen += (val(b.l) * val(b.b) * val(b.d)); });
        if(data.mainBeams?.concealed && Array.isArray(data.mainBeams.concealed)) data.mainBeams.concealed.forEach(b => { if(b) volConcealed += (val(b.l) * val(b.b) * val(b.d)); });
        if(data.mainBeams?.drop && Array.isArray(data.mainBeams.drop)) data.mainBeams.drop.forEach(b => { if(b) volDrop += (val(b.l) * val(b.b) * val(b.d)); });
        
        const beamVolTotal = volOpen + volConcealed + volDrop;
        const concreteVol = beamVolTotal + netLintelVol;

        // 5. OPENINGS
        let openVol = 0; let openArea = 0;
        if (Array.isArray(data.openings)) {
            openVol = data.openings.reduce((sum, o) => sum + (o ? (safeNum(o.width) * safeNum(o.height) * safeNum(o.wallSize) * safeNum(o.nos)) : 0), 0);
            openArea = data.openings.reduce((sum, o) => sum + (o ? (safeNum(o.width) * safeNum(o.height) * safeNum(o.nos)) : 0), 0);
        }
        const openAreaDed = openArea * 2; 

        const manVolDed = val(data.deductionVol);
        const colVolDed = val(data.deductionCols);
        const manAreaDed = val(data.deductionArea);
        const manCarpetDed = val(data.deductionCarpet);
        
        // 6. NET TOTALS
        const grossVolTotal = safeNum(scheduleVol);
        const totalNetVol = grossVolTotal + safeNum(adjustVol) - safeNum(openVol) - safeNum(netLintelVol) - safeNum(beamVolTotal) - safeNum(colVolDed) - safeNum(manVolDed);
        const totalNetArea = (scheduleArea + adjustArea) - openAreaDed - manAreaDed;

        setStats({
            scheduleVol, scheduleArea, totalWallLen: totalLen, 
            adjustVol, adjustArea,
            grossVol: grossVolTotal,
            openVol: openVol,
            netVol: totalNetVol,
            grossArea: scheduleArea + adjustArea, openAreaDed, netArea: totalNetArea,
            plinthA: val(data.plinthArea), footprint, netCarpet: val(data.plinthArea) - footprint - manCarpetDed,
            grossLintelVol: totalLintelVol,
            lintelVol: netLintelVol,
            beamVolConcealed: volConcealed, beamVolDrop: volDrop, beamVolOpen: volOpen, beamVolTotal: beamVolTotal,
            concreteVolume: concreteVol
        });

    }, [data]);

    // --- HANDLERS ---
    const updateBaseWall = (type, field, val) => { 
        const cleanVal = (field === 'l' || field === 'b') ? handleMathInput(val) : val; 
        setData(prev => ({ ...prev, [type]: { ...prev[type], [field]: cleanVal } })); 
    };
    const updateField = (field, val) => { 
        const cleanVal = handleMathInput(val); 
        setData(prev => ({ ...prev, [field]: cleanVal })); 
    };

    // --- SAFE ADD/UPDATE HANDLERS ---
    const addWall = (type) => { 
        const isExt = type === 'exterior'; 
        const newWall = { id: Date.now() + Math.random(), name: isExt ? 'Extra Ext. Wall' : 'Partition Wall', l: '0', b: isExt ? '0.23' : '0.10', h: '3.0', isPlinthExempt: false }; 
        setData(prev => ({ ...prev, customWalls: [...(prev.customWalls || []), newWall] })); 
    };
    
    const updateCustomWall = (id, field, val) => { 
        const cleanVal = (field === 'l' || field === 'b') ? handleMathInput(val) : val; 
        setData(prev => ({ ...prev, customWalls: (prev.customWalls || []).map(w => w.id === id ? { ...w, [field]: cleanVal } : w) })); 
    };
    
    const toggleCustomWallExempt = (id) => setData(prev => ({ ...prev, customWalls: (prev.customWalls || []).map(w => w.id === id ? { ...w, isPlinthExempt: !w.isPlinthExempt } : w) }));
    
    const removeCustomWall = (id) => setData(prev => ({ ...prev, customWalls: (prev.customWalls || []).filter(w => w.id !== id) }));
    
    const addAdjustment = (mode = 'add') => {
        const newItem = { 
            id: Date.now() + Math.random(), // Unique Key 
            mode: mode, 
            name: mode === 'deduct' ? 'Lintel Deduction' : 'Parapet Wall', 
            l: '0', 
            b: '0.23', 
            h: mode === 'deduct' ? '0.9' : '1.0' 
        };
        setData(prev => ({ 
            ...prev, 
            irregularWalls: [...(Array.isArray(prev.irregularWalls) ? prev.irregularWalls : []), newItem] 
        })); 
    };
    
    const updateAdjustment = (id, field, val) => { 
        const cleanVal = (field === 'l' || field === 'b') ? handleMathInput(val) : val; 
        setData(prev => ({ 
            ...prev, 
            irregularWalls: (prev.irregularWalls || []).map(w => (w && w.id === id) ? { ...w, [field]: cleanVal } : w) 
        })); 
    };
    
    const removeAdjustment = (id) => {
        setData(prev => ({ 
            ...prev, 
            irregularWalls: (prev.irregularWalls || []).filter(w => w && w.id !== id) 
        }));
    };

    const addMainBeam = (type) => { 
        const newBeam = { id: Date.now() + Math.random(), l: '', b: 0.23, d: 0.45 }; 
        setData(prev => ({ ...prev, mainBeams: { ...prev.mainBeams, [type]: [...(prev.mainBeams[type] || []), newBeam] } })); 
    };
    const updateMainBeam = (type, id, field, val) => { const cleanVal = (field === 'l') ? handleMathInput(val) : val; setData(prev => ({ ...prev, mainBeams: { ...prev.mainBeams, [type]: prev.mainBeams[type].map(b => b.id === id ? { ...b, [field]: cleanVal } : b) } })); };
    const removeMainBeam = (type, id) => { setData(prev => ({ ...prev, mainBeams: { ...prev.mainBeams, [type]: prev.mainBeams[type].filter(b => b.id !== id) } })); };
    const updateOpenAreaBeam = (id, field, val) => { const cleanVal = (field === 'l' || field === 'b' || field === 'd' || field === 'heightFromFloor') ? handleMathInput(val) : val; setData(prev => ({ ...prev, openAreaBeams: prev.openAreaBeams.map(b => b.id === id ? { ...b, [field]: cleanVal } : b) })); };
    const addLintelDeduction = () => { const defaultWidth = availableWallWidths.length > 0 ? availableWallWidths[0] : 0.23; const newDeduction = { id: Date.now() + Math.random(), l: '', b: defaultWidth }; setData(prev => ({ ...prev, lintels: { ...prev.lintels, deductions: [...(prev.lintels.deductions || []), newDeduction] } })); };
    const updateLintelDeduction = (id, field, val) => { const cleanVal = (field === 'l') ? handleMathInput(val) : val; setData(prev => ({ ...prev, lintels: { ...prev.lintels, deductions: prev.lintels.deductions.map(d => d.id === id ? { ...d, [field]: cleanVal } : d) } })); };
    const removeLintelDeduction = (id) => { setData(prev => ({ ...prev, lintels: { ...prev.lintels, deductions: prev.lintels.deductions.filter(d => d.id !== id) } })); };
    
    return (
        <div className="space-y-8">
            {/* BASE DIMENSIONS */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4"><Ruler size={16}/> Base Dimensions</h4>
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="Total Plinth Area (m²)" value={data.plinthArea} onChange={(v) => updateField('plinthArea', v)} icon={Maximize2} placeholder="e.g. 120" />
                    <InputGroup label="Plinth Perimeter (m)" value={data.plinthPerimeter} onChange={(v) => updateField('plinthPerimeter', v)} icon={Ruler} placeholder="e.g. 45" />
                </div>
            </div>

            {/* WALL SCHEDULE */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-100 p-3 border-b border-gray-200"><h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><BrickWall size={16}/> Wall Schedule</h4></div>
                <div className="grid grid-cols-12 bg-gray-50 p-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
                    <div className="col-span-4 pl-2">Name</div><div className="col-span-2 text-center">Length</div><div className="col-span-2 text-center">Width</div><div className="col-span-2 text-center">Height</div><div className="col-span-2 text-center">Status</div>
                </div>
                <div className="divide-y divide-gray-100">
                    <WallRow label="Main Exterior Wall" data={data.extWall} onChange={(f, v) => updateBaseWall('extWall', f, v)} readOnlyLB={isGroundFloor} tag={isGroundFloor ? "Auto" : "Manual"} tagColor="bg-blue-100 text-blue-700" evaluateMath={evaluateMath}/>
                    <WallRow label="Main Interior Wall" data={data.intWall} onChange={(f, v) => updateBaseWall('intWall', f, v)} readOnlyLB={isGroundFloor} tag={isGroundFloor ? "Auto" : "Manual"} tagColor="bg-green-100 text-green-700" evaluateMath={evaluateMath}/>
                    
                    {/* SAFE RENDER: CUSTOM WALLS */}
                    {Array.isArray(data.customWalls) && data.customWalls.map(w => {
                        if (!w) return null; // Skip invalid
                        return (
                            <div key={w.id} className="grid grid-cols-12 gap-2 p-2 items-center bg-orange-50 border-b border-orange-100"> 
                                <div className="col-span-4"><input className="w-full p-1 border rounded text-xs font-bold" value={w.name} onChange={(e) => updateCustomWall(w.id, 'name', e.target.value)} /></div>
                                <div className="col-span-2 relative group">
                                    <input type="text" className="w-full p-1 border rounded text-center text-xs bg-white" value={w.l} onChange={(e) => updateCustomWall(w.id, 'l', e.target.value)} />
                                    {evaluateMath(w.l) !== parseFloat(w.l) && w.l !== '' && <div className="absolute top-full left-0 w-full text-center text-[9px] text-gray-500 bg-white border z-10 shadow-sm rounded">= {evaluateMath(w.l).toFixed(2)}</div>}
                                </div>
                                <div className="col-span-2"><input type="number" className="w-full p-1 border rounded text-center text-xs bg-white" value={w.b} onChange={(e) => updateCustomWall(w.id, 'b', e.target.value)} /></div>
                                <div className="col-span-2"><input type="number" className="w-full p-1 border rounded text-center text-sm font-bold bg-white" value={w.h} onChange={(e) => updateCustomWall(w.id, 'h', e.target.value)} /></div>
                                <div className="col-span-2 flex justify-center items-center gap-2">
                                    <button onClick={() => toggleCustomWallExempt(w.id)} className={`text-[9px] px-2 py-0.5 rounded border font-bold ${w.isPlinthExempt ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500'}`}>{w.isPlinthExempt ? 'Not in Plinth' : 'Standard'}</button>
                                    <button onClick={() => removeCustomWall(w.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-xs shadow-md">
                    <div className="flex gap-4"><span>Total Length: <span className="text-yellow-400 font-bold">{safeFloat(stats.totalWallLen)} m</span></span><span>|</span><span>Total Area (2 sides): <span className="text-yellow-400 font-bold">{safeFloat(stats.scheduleArea)} m²</span></span></div>
                    <span>Total Volume: <span className="text-yellow-400 font-mono font-bold text-sm">{safeFloat(stats.scheduleVol)} m³</span></span>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50 flex gap-2">
                    <button onClick={() => addWall('exterior')} className="flex-1 text-xs text-blue-700 border border-blue-200 bg-white font-bold py-2 rounded shadow-sm hover:bg-blue-50 transition-colors"><Home className="inline mr-1" size={14}/> Add Ext. Wall</button>
                    <button onClick={() => addWall('partition')} className="flex-1 text-xs text-green-700 border border-green-200 bg-white font-bold py-2 rounded shadow-sm hover:bg-green-50 transition-colors"><Grid className="inline mr-1" size={14}/> Add Partition</button>
                </div>
            </div>

            {/* WALL ADJUSTMENTS */}
            <div className="bg-orange-50/50 rounded-xl border border-orange-200 p-4">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2"><Calculator size={16}/> Wall Adjustments</h4>
                    <div className="flex gap-2">
                        <button onClick={() => addAdjustment('add')} className="text-xs bg-white text-green-700 border border-green-300 px-3 py-1 rounded font-bold">+ Extra</button>
                        <button onClick={() => addAdjustment('deduct')} className="text-xs bg-white text-red-700 border border-red-300 px-3 py-1 rounded font-bold">- Height</button>
                    </div>
                </div>
                
                {/* SAFE RENDER: ADJUSTMENTS */}
                {Array.isArray(data.irregularWalls) && data.irregularWalls.map(w => {
                    if (!w) return null; // Skip invalid
                    return (
                        <div key={w.id} className="flex gap-2 items-center p-2 mb-2 rounded border bg-white">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full ${w.mode === 'deduct' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{w.mode === 'deduct' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>}</div>
                            <input className="flex-[2] p-1 text-xs border rounded" value={w.name} onChange={(e) => updateAdjustment(w.id, 'name', e.target.value)} />
                            <input type="text" className="flex-1 p-1 text-xs border rounded text-center" value={w.l} onChange={(e) => updateAdjustment(w.id, 'l', e.target.value)} />
                            <input type="number" className="flex-1 p-1 text-xs border rounded text-center" value={w.b} onChange={(e) => updateAdjustment(w.id, 'b', e.target.value)} />
                            <input type="number" className="flex-1 p-1 text-xs border rounded text-center font-bold" value={w.h} onChange={(e) => updateAdjustment(w.id, 'h', e.target.value)} />
                            <button onClick={() => removeAdjustment(w.id)} className="text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                    );
                })}
                
                <div className="mt-3 bg-orange-100 p-2 rounded text-xs font-bold text-orange-900 flex justify-between items-center border border-orange-200">
                    <span>Net Adjustment Area: <span className={stats.adjustArea < 0 ? 'text-red-600' : 'text-green-700'}>{stats.adjustArea >= 0 ? '+' : ''}{safeFloat(stats.adjustArea)} m²</span></span>
                    <span>Net Adjustment Volume: <span className={stats.adjustVol < 0 ? 'text-red-600' : 'text-green-700'}>{stats.adjustVol >= 0 ? '+' : ''}{safeFloat(stats.adjustVol)} m³</span></span>
                </div>
            </div>

            <OpeningManager floorName={floorName} openings={data.openings} setOpenings={(newOpenings) => setData(prev => ({...prev, openings: newOpenings}))} wallOptions={availableWallWidths} />

            <BeamLintelManager 
                openAreaBeams={data.openAreaBeams}
                mainBeams={data.mainBeams}
                lintels={data.lintels}
                totalWallLength={safeFloat(stats.totalWallLen)}
                volConcealed={safeFloat(stats.beamVolConcealed)}
                volDrop={safeFloat(stats.beamVolDrop)}
                volOpen={safeFloat(stats.beamVolOpen)}
                beamVolume={safeFloat(stats.beamVolTotal)}
                lintelVolume={safeFloat(stats.lintelVol)}
                grossLintelVol={safeFloat(stats.grossLintelVol)} 
                wallOptions={availableWallWidths}
                onAddMainBeam={addMainBeam}
                onUpdateMainBeam={updateMainBeam}
                onRemoveMainBeam={removeMainBeam}
                onUpdateOpenAreaBeam={updateOpenAreaBeam}
                onAddLintelDeduction={addLintelDeduction}
                onUpdateLintelDeduction={updateLintelDeduction}
                onRemoveLintelDeduction={removeLintelDeduction}
                evaluateMath={evaluateMath}
            />

            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-lg">
                <h4 className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-4">Final Estimates</h4>
                
                <div className="mb-6">
                    <div className="flex justify-between text-sm font-bold text-gray-800 mb-2"><span>Net Brick Masonry (m³)</span><span className="text-indigo-700 text-xl">{safeFloat(stats.netVol)}</span></div>
                    
                    <div className="text-xs text-gray-700 border border-indigo-100 rounded overflow-hidden shadow-inner">
                        <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50"><span>1. Total Gross Wall Volume:</span> <span className="font-bold">{safeFloat(stats.grossVol)}</span></div>
                        <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-blue-600"><span>2. Wall Adjustments (Add/Deduct):</span> <span>{stats.adjustVol >= 0 ? '+' : ''}{safeFloat(stats.adjustVol)}</span></div>
                        <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50 text-red-500"><span>3. Less: Openings Volume:</span> <span>-{safeFloat(stats.openVol)}</span></div>
                        <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-red-500"><span>4. Less: Lintel Volume:</span> <span>-{safeFloat(stats.lintelVol)}</span></div>
                        <div className="flex justify-between items-center p-2.5 bg-white border-b border-indigo-50 text-red-500"><span>5. Less: Beam Volume (Concealed + Drop + Open):</span> <span>-{safeFloat(stats.beamVolTotal)}</span></div>
                        <div className="flex justify-between items-center p-2.5 bg-orange-50 border-b border-indigo-50 text-red-500"><span>6. Less: Columns Deduction:</span><div className="flex items-center gap-1"><span>-</span><input type="text" className="w-20 p-1 text-right text-xs border border-red-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-red-300" value={data.deductionCols} onChange={(e) => updateField('deductionCols', e.target.value)} placeholder="0.00"/></div></div>
                        <div className="flex justify-between items-center p-2.5 bg-white text-red-500"><span>7. Less: Other Deductions:</span><div className="flex items-center gap-1"><span>-</span><input type="text" className="w-20 p-1 text-right text-xs border border-red-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-red-300" value={data.deductionVol} onChange={(e) => updateField('deductionVol', e.target.value)} placeholder="0.00"/></div></div>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1"><span>Wall Plaster Area (m²)</span><span className="text-indigo-700 text-lg">{safeFloat(stats.netArea)}</span></div>
                    <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-indigo-100 flex flex-col gap-1 shadow-inner">
                         <div className="flex justify-between"><span>Gross Area (2 sides):</span> <span>{safeFloat(stats.grossArea)}</span></div>
                         <div className="flex justify-between text-red-500"><span>- Opening Deduction:</span> <span>-{safeFloat(stats.openAreaDed)}</span></div>
                         <div className="flex justify-between items-center text-red-500 border-t border-dashed pt-1"><span>- Other Deductions:</span><input type="text" className="w-16 p-0.5 text-right text-xs border rounded bg-red-50" value={data.deductionArea} onChange={(e) => updateField('deductionArea', e.target.value)} /></div>
                    </div>
                </div>

                 <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1"><span>Carpet Area (m²)</span><span className="text-indigo-700 text-lg">{safeFloat(stats.netCarpet)}</span></div>
                    <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-indigo-100 flex flex-col gap-1 shadow-inner">
                         <div className="flex justify-between"><span>Plinth Area:</span> <span>{safeFloat(stats.plinthA)}</span></div>
                         <div className="flex justify-between text-red-500"><span>- Wall Footprint:</span> <span>-{safeFloat(stats.footprint)}</span></div>
                         <div className="flex justify-between items-center text-red-500 border-t border-dashed pt-1"><span>- Other Deductions:</span><input type="text" className="w-16 p-0.5 text-right text-xs border rounded bg-red-50" value={data.deductionCarpet} onChange={(e) => updateField('deductionCarpet', e.target.value)} /></div>
                    </div>
                </div>

                <button onClick={() => handleSave(onSave, data, stats)} className="w-full mt-2 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-shadow shadow-md flex items-center justify-center gap-2"><Save size={18}/> Save {floorName} Data</button>
            </div>
        </div>
    );
}

// ... WallRow, InputGroup, handleSave ...
const WallRow = ({ label, data, onChange, readOnlyLB, tag, tagColor, evaluateMath }) => (
    <div className="grid grid-cols-12 gap-2 p-2 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50">
        <div className="col-span-4 pl-2 text-xs font-bold text-gray-700">{label}</div>
        <div className="col-span-2 relative group">
            {readOnlyLB ? <div className="text-center text-xs text-gray-500 py-1 bg-gray-100 rounded">{parseFloat(data.l).toFixed(2)}</div> : <input type="text" className="w-full p-1 border border-blue-200 rounded text-center text-xs font-bold text-blue-700 bg-blue-50" value={data.l} onChange={(e) => onChange('l', e.target.value)} placeholder="e.g. 5+3" />}
            {!readOnlyLB && evaluateMath && evaluateMath(data.l) !== parseFloat(data.l) && data.l !== '' && <div className="absolute top-full left-0 w-full text-center text-[9px] text-gray-500 bg-white border z-10 shadow-sm rounded"> = {evaluateMath(data.l).toFixed(2)}</div>}
        </div>
        <div className="col-span-2">{readOnlyLB ? <div className="text-center text-xs text-gray-500 py-1 bg-gray-100 rounded">{parseFloat(data.b).toFixed(2)}</div> : <input type="number" className="w-full p-1 border border-blue-200 rounded text-center text-xs font-bold text-blue-700 bg-blue-50" value={data.b} onChange={(e) => onChange('b', e.target.value)} placeholder="B" />}</div>
        <div className="col-span-2"><input type="number" className="w-full p-1 border rounded text-center text-sm font-bold bg-white" value={data.h} onChange={(e) => onChange('h', e.target.value)} /></div>
        <div className="col-span-2 flex justify-center"><span className={`text-[9px] px-2 py-0.5 rounded border ${tagColor}`}>{tag}</span></div>
    </div>
);

const InputGroup = ({ label, value, onChange, icon: Icon, placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">{Icon && <Icon size={14} className="text-gray-400" />} {label}</label>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all" placeholder={placeholder} />
    </div>
);

const handleSave = (onSave, data, computedData) => { if (onSave) onSave({ ...data, computed: computedData }); };