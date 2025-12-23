import React, { useEffect, useRef, useMemo } from 'react';
import { Columns, Trash2, Plus, CheckSquare, Square, BrickWall, PaintRoller, PlusCircle } from 'lucide-react';

export default function ColumnDeductionManager({ 
    manualColumnDeductions = [], 
    setManualColumnDeductions, 
    projectConcealedColumns = [], 
    projectOpenColumns = [], 
    evaluateMath,
    safeFloat,
    safeNum 
}) {
    const hasAutoSelected = useRef(false);

    // --- 1. DATA PREP ---
    const concealedCols = useMemo(() => projectConcealedColumns.filter(c => 
        c.type === 'Conceiled' || (c.name || "").toLowerCase().includes("conceal")
    ).map((c, index) => ({ ...c, uniqueId: `conceal-${index}` })), [projectConcealedColumns]);

    const openCols = useMemo(() => {
        if (projectOpenColumns && projectOpenColumns.length > 0) {
            return projectOpenColumns.map((c, index) => ({ ...c, uniqueId: `open-explicit-${index}` }));
        }
        return projectConcealedColumns.filter(c => 
            c.type === 'Open' || (c.name || "").toLowerCase().includes("open") || (c.name || "").toLowerCase().includes("sitout")
        ).map((c, index) => ({ ...c, uniqueId: `open-derived-${index}` }));
    }, [projectConcealedColumns, projectOpenColumns]);

    // --- 2. AUTO-SELECT LOGIC ---
    useEffect(() => {
        if (!hasAutoSelected.current && concealedCols.length > 0) {
            const existingRefs = (manualColumnDeductions || []).map(d => d.refId);
            const toAdd = concealedCols
                .filter(c => !existingRefs.includes(c.uniqueId))
                .map(c => ({
                    id: Math.random() + Date.now(),
                    refId: c.uniqueId,
                    type: 'concealed',
                    isManual: false, // Standard Project Column
                    name: c.name,
                    l: c.c_l || "0.23",
                    b: c.c_b || "0.23", 
                    h: "3.0",
                    nos: c.count || "1",
                }));

            if (toAdd.length > 0) {
                setManualColumnDeductions(prev => [...(Array.isArray(prev) ? prev : []), ...toAdd]);
            }
            hasAutoSelected.current = true;
        }
    }, [concealedCols]);

    // --- 3. HELPER FUNCTIONS ---
    const isTicked = (uniqueId) => (manualColumnDeductions || []).some(d => d.refId === uniqueId);

    const updateCol = (id, field, val) => {
        setManualColumnDeductions(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
    };

    const toggleColumn = (col, categoryType) => {
        if (isTicked(col.uniqueId)) {
            setManualColumnDeductions(prev => prev.filter(d => d.refId !== col.uniqueId));
        } else {
            const newEntry = {
                id: Date.now() + Math.random(),
                refId: col.uniqueId, 
                type: categoryType,
                isManual: false,
                name: col.name,
                l: col.c_l || "0.23",
                b: col.c_b || "0.23", 
                h: "3.0",
                nos: col.count || "1",
            };
            setManualColumnDeductions(prev => [...(Array.isArray(prev) ? prev : []), newEntry]);
        }
    };

    const toggleCategory = (categoryList, categoryType) => {
        const allTicked = categoryList.every(c => isTicked(c.uniqueId));
        if (allTicked) {
            const catIds = categoryList.map(c => c.uniqueId);
            setManualColumnDeductions(prev => prev.filter(d => !catIds.includes(d.refId)));
        } else {
            const toAdd = categoryList
                .filter(c => !isTicked(c.uniqueId))
                .map(c => ({
                    id: Math.random() + Date.now(),
                    refId: c.uniqueId,
                    type: categoryType,
                    isManual: false,
                    name: c.name,
                    l: c.c_l || "0.23",
                    b: c.c_b || "0.23", 
                    h: "3.0",
                    nos: c.count || "1",
                }));
            setManualColumnDeductions(prev => [...(Array.isArray(prev) ? prev : []), ...toAdd]);
        }
    };

    // --- 4. MANUAL ADD HANDLER ---
    const addManualEntry = (type) => {
        const newEntry = {
            id: Date.now(),
            refId: `manual-${Date.now()}`, // unique ID for manual
            type: type, // 'concealed' or 'open'
            isManual: true, // FLAG FOR HIGHLIGHTING
            name: type === 'concealed' ? "Manual Concealed Col" : "Manual Open Col",
            l: "0.23",
            b: "0.23",
            h: "3.0",
            nos: "1"
        };
        setManualColumnDeductions(prev => [...(Array.isArray(prev) ? prev : []), newEntry]);
    };

    // --- 5. CALCULATIONS & SPLITTING ---
    const brickDeductionList = (manualColumnDeductions || []).filter(d => d.type === 'concealed');
    const plasterAdditionList = (manualColumnDeductions || []).filter(d => d.type === 'open');

    const brickTotals = brickDeductionList.reduce((acc, col) => {
        const vol = safeNum(evaluateMath(col.l)) * safeNum(evaluateMath(col.b)) * safeNum(evaluateMath(col.h)) * safeNum(col.nos);
        return acc + vol;
    }, 0);

    const plasterTotals = plasterAdditionList.reduce((acc, col) => {
        const area = safeNum(evaluateMath(col.l)) * safeNum(evaluateMath(col.b)) * safeNum(col.nos); 
        return acc + area;
    }, 0);

    // --- 6. RENDER ROW ---
    const renderRow = (col, themeColor) => {
        const lVal = safeNum(evaluateMath(col.l));
        const bVal = safeNum(evaluateMath(col.b));
        const hVal = safeNum(evaluateMath(col.h));
        const vol = lVal * bVal * hVal * safeNum(col.nos);
        
        // Dynamic Styles
        // If Manual: Yellow/Amber background. If Auto: White background.
        const rowBg = col.isManual ? "bg-amber-50" : "bg-white";
        const rowBorder = col.isManual ? "border-l-4 border-l-amber-400" : "border-b border-gray-50";
        const inputBg = col.isManual ? "bg-amber-100/50 focus:bg-white" : "bg-gray-50/50 focus:bg-white";

        return (
            <tr key={col.id} className={`${rowBg} ${rowBorder} hover:brightness-95 transition-all`}>
                <td className="p-3 text-left">
                    <div className="flex items-center gap-2">
                        {col.isManual && <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 rounded font-black uppercase tracking-wider">Manual</span>}
                        <input 
                            className={`w-full p-2 border border-transparent rounded outline-none font-bold bg-transparent transition-all`}
                            value={col.name} 
                            onChange={(e) => updateCol(col.id, "name", e.target.value)} 
                        />
                    </div>
                </td>
                <td className="p-3"><input className={`w-full p-2 rounded-lg text-center ${inputBg}`} value={col.l} onChange={(e) => updateCol(col.id, "l", e.target.value)} /></td>
                <td className="p-3"><input className={`w-full p-2 rounded-lg text-center ${inputBg}`} value={col.b} onChange={(e) => updateCol(col.id, "b", e.target.value)} /></td>
                <td className="p-3"><input className={`w-full p-2 rounded-lg text-center ${inputBg}`} value={col.h} onChange={(e) => updateCol(col.id, "h", e.target.value)} /></td>
                <td className="p-3"><input className={`w-full p-2 rounded-lg text-center font-black ${inputBg}`} value={col.nos} onChange={(e) => updateCol(col.id, "nos", e.target.value)} /></td>
                
                <td className={`p-3 text-right pr-8 font-mono font-black ${themeColor === 'red' ? 'text-red-600' : 'text-blue-600'}`}>
                    {themeColor === 'red' ? `-${vol.toFixed(3)}` : `+${(lVal * bVal * safeNum(col.nos)).toFixed(3)}`}
                </td>
                
                <td className="p-3">
                    <button onClick={() => setManualColumnDeductions(prev => prev.filter(d => d.id !== col.id))} className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white rounded-xl border-2 border-indigo-50 overflow-hidden shadow-sm mt-6 font-sans">
            
            {/* HEADER */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Columns size={20} className="text-indigo-600" />
                    <h4 className="text-sm font-bold uppercase tracking-tight text-gray-800">Column Deductions & Additions</h4>
                </div>
            </div>

            <div className="p-4 space-y-8">
                
                {/* 1. SELECTION AREA (AUTO COLUMNS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Concealed Select */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-500 uppercase">1. Auto-Detect Concealed</span>
                            <button onClick={() => toggleCategory(concealedCols, 'concealed')} className="text-[10px] text-indigo-600 font-bold hover:underline">Toggle All</button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {concealedCols.map((c) => (
                                <div key={c.uniqueId} onClick={() => toggleColumn(c, 'concealed')} className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${isTicked(c.uniqueId) ? 'bg-red-50 border-red-200' : 'bg-white border-transparent hover:border-gray-300'}`}>
                                    {isTicked(c.uniqueId) ? <CheckSquare size={14} className="text-red-500" /> : <Square size={14} className="text-gray-300" />}
                                    <span className="text-xs font-medium text-gray-700">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Open Select */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-500 uppercase">2. Auto-Detect Open/Porch</span>
                            <button onClick={() => toggleCategory(openCols, 'open')} className="text-[10px] text-indigo-600 font-bold hover:underline">Toggle All</button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {openCols.map((c) => (
                                <div key={c.uniqueId} onClick={() => toggleColumn(c, 'open')} className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${isTicked(c.uniqueId) ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-gray-300'}`}>
                                    {isTicked(c.uniqueId) ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} className="text-gray-300" />}
                                    <span className="text-xs font-medium text-gray-700">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. MANUAL ENTRY CONTROL BAR (ABOVE TABLES) */}
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><PlusCircle size={18} /></div>
                        <div>
                            <div className="text-xs font-black text-indigo-900 uppercase">Add Manual Column</div>
                            <div className="text-[10px] text-indigo-500">Column not in the plan? Add it here.</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* Button 1: Add Concealed */}
                        <button 
                            onClick={() => addManualEntry('concealed')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-300 hover:shadow active:scale-95 transition-all text-xs font-bold uppercase"
                        >
                            <Plus size={14} /> Add to Brick (Concealed)
                        </button>
                        
                        {/* Button 2: Add Open */}
                        <button 
                            onClick={() => addManualEntry('open')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:shadow active:scale-95 transition-all text-xs font-bold uppercase"
                        >
                            <Plus size={14} /> Add to Plaster (Open)
                        </button>
                    </div>
                </div>

                {/* --- SECTION 3: BRICK DEDUCTIONS (RED THEME) --- */}
                <div className="border border-red-100 rounded-xl overflow-hidden">
                    <div className="bg-red-50/50 p-3 flex justify-between items-center border-b border-red-100">
                        <div className="flex items-center gap-2 text-red-800">
                            <BrickWall size={18} />
                            <span className="text-xs font-black uppercase">Brick Work Deductions (Concealed)</span>
                        </div>
                        <div className="text-[10px] text-red-400 font-medium">Subtracts Volume</div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="text-gray-400 bg-white border-b border-gray-100">
                                <tr>
                                    <th className="p-3 text-left w-1/3">Column Name</th>
                                    <th className="p-3">L</th><th className="p-3">B</th><th className="p-3">H</th><th className="p-3">Nos</th>
                                    <th className="p-3 text-right pr-8">Volume (m³)</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {brickDeductionList.length === 0 ? (
                                    <tr><td colSpan="7" className="p-6 text-center text-gray-400 italic">No concealed columns. Add manually or select above.</td></tr>
                                ) : (
                                    brickDeductionList.map(col => renderRow(col, 'red'))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="bg-red-100/30 p-3 flex justify-end items-center gap-4 border-t border-red-100">
                        <span className="text-xs font-medium text-red-800 uppercase">Total Deduction:</span>
                        <span className="text-lg font-black text-red-600">-{safeFloat(brickTotals)} m³</span>
                    </div>
                </div>

                {/* --- SECTION 4: PLASTERING ADDITIONS (BLUE THEME) --- */}
                <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50/50 p-3 flex justify-between items-center border-b border-blue-100">
                        <div className="flex items-center gap-2 text-blue-800">
                            <PaintRoller size={18} />
                            <span className="text-xs font-black uppercase">Plastering Area Additions (Open)</span>
                        </div>
                        <div className="text-[10px] text-blue-400 font-medium">Adds Area</div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="text-gray-400 bg-white border-b border-gray-100">
                                <tr>
                                    <th className="p-3 text-left w-1/3">Column Name</th>
                                    <th className="p-3">L</th><th className="p-3">B</th><th className="p-3">H</th><th className="p-3">Nos</th>
                                    <th className="p-3 text-right pr-8">Area (m²)</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {plasterAdditionList.length === 0 ? (
                                    <tr><td colSpan="7" className="p-6 text-center text-gray-400 italic">No open columns. Add manually or select above.</td></tr>
                                ) : (
                                    plasterAdditionList.map(col => renderRow(col, 'blue'))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="bg-blue-100/30 p-3 flex justify-end items-center gap-4 border-t border-blue-100">
                        <span className="text-xs font-medium text-blue-800 uppercase">Total Addition:</span>
                        <span className="text-lg font-black text-blue-600">+{safeFloat(plasterTotals)} m²</span>
                    </div>
                </div>

            </div>
        </div>
    );
}