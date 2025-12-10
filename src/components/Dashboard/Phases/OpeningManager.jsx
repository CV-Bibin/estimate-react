import React from 'react';
import { Plus, Trash2, DoorOpen, BrickWall } from 'lucide-react';

// Function to get default dimensions based on opening type
const getDefaultDimensions = (type) => {
    switch (type) {
        case 'Door':
            return { length: 1.0, width: 2.1 }; // 1.0m width, 2.1m height
        case 'Window':
        case 'Grill Window': // Use the same dimensions as standard window
            return { length: 1.5, width: 1.5 }; // 1.5m width, 1.5m height
        case 'Ventilator':
            return { length: 0.6, width: 0.45 }; // 0.6m width, 0.45m height
        case 'Arch Opening':
        case 'Rectangular Opening':
            return { length: 1.5, width: 2.1 }; // 1.5m width, 2.1m height
        default:
            return { length: 1.0, width: 2.1 }; // Default to door size
    }
};

export default function OpeningManager({ 
    floorName, 
    openings, 
    setOpenings,
    extWallWidth,
    intWallWidth
}) {
    
    // --- Data Management Functions (Simplified for this update) ---

    const addOpeningGroup = () => {
        const defaultDimensions = getDefaultDimensions('Door');
        const defaultWallType = (parseFloat(extWallWidth) || 0.23).toFixed(2).toString();
        
        const newGroup = {
            id: Date.now(),
            type: 'Door',
            length: defaultDimensions.length, 
            width: defaultDimensions.width,  
            wallType: defaultWallType, 
            nos: 1, 
        };
        setOpenings([...openings, newGroup]);
    };

    const updateOpeningGroup = (id, field, value) => {
        const newOpenings = openings.map(o => {
            if (o.id === id) {
                const parsedValue = (field === 'length' || field === 'width' || field === 'nos') ? parseFloat(value) || 0 : value;
                
                let updatedOpening = { ...o, [field]: parsedValue };

                if (field === 'type') {
                    const newDefaults = getDefaultDimensions(value);
                    updatedOpening.length = newDefaults.length;
                    updatedOpening.width = newDefaults.width;
                }
                
                return updatedOpening;
            }
            return o;
        });
        setOpenings(newOpenings);
    };

    const removeOpeningGroup = (id) => {
        setOpenings(openings.filter(o => o.id !== id));
    };
    
    // --- CALCULATIONS ---
    const totalOpeningArea = openings.reduce((sum, o) => sum + (parseFloat(o.length || 0) * parseFloat(o.width || 0) * (parseFloat(o.nos) || 0)), 0).toFixed(2);
    
    // NEW: Calculate Total Grill Area separately for B.O.Q.
    const totalGrillArea = openings.reduce((sum, o) => {
        if (o.type === 'Grill Window') {
            return sum + (parseFloat(o.length || 0) * parseFloat(o.width || 0) * (parseFloat(o.nos) || 0));
        }
        return sum;
    }, 0).toFixed(2);
    
    // --- Wall Thickness Logic ---
    const extW = (parseFloat(extWallWidth) || 0.23).toFixed(2);
    const intW = (parseFloat(intWallWidth) || 0.15).toFixed(2);

    const isSingleThickness = extW === intW;
    
    const wallOptions = [];
    if (parseFloat(extW) > 0) {
         wallOptions.push({ value: extW, label: `${extW} m (Exterior Wall)` });
    }
    if (parseFloat(intW) > 0 && !isSingleThickness) {
         wallOptions.push({ value: intW, label: `${intW} m (Interior Wall)` });
    }

    // --- Calculate Total Counts per Type (Updated to track Grill Window separately) ---
    const totalCounts = openings.reduce((counts, o) => {
        const type = o.type.replace(/\s/g, ''); 
        counts[type] = (counts[type] || 0) + (parseFloat(o.nos) || 0);
        return counts;
    }, {});
    
    const totalCountLabels = [
        { type: 'Door', label: 'Doors' },
        { type: 'Window', label: 'Windows' },
        { type: 'Ventilator', label: 'Ventilators' },
        { type: 'ArchOpening', label: 'Arch Openings' },
        { type: 'RectangularOpening', label: 'Rectangular Openings' },
         { type: 'GrillWindow', label: 'Grill Windows' }, // SEPARATE LABEL
    ];


    // --- Rendering Logic ---

    const tableHeaders = [
        { title: "Type", key: "type", width: "18%" },
        { title: "Width (m)", key: "length", width: "10%" },
        { title: "Height (m)", key: "width", width: "10%" },
        { title: "Nos. (Total)", key: "nos", width: "8%" },
        { title: "Wall Size", key: "wallType", width: "20%" },
        { title: "Area (m²)", key: "area_calc", width: "14%" },
        { title: "", key: "delete", width: "10%" },
    ];
    
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
            <h4 className="text-md font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                <DoorOpen size={16}/> Doors, Windows & Openings ({floorName})
            </h4>

            {/* TOTAL COUNTS SUMMARY */}
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg text-xs font-medium mb-4 border border-gray-200">
                {totalCountLabels.map(({ type, label }) => {
                    const count = totalCounts[type.replace(/\s/g, '')] || 0;
                    return (
                        <div key={type} className="text-center px-2">
                            <span className="text-gray-500">{label}:</span>
                            <span className={`font-bold ml-1 ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{count}</span>
                        </div>
                    );
                })}
            </div>

            {/* OPENINGS TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                            {tableHeaders.map(header => (
                                <th key={header.key} className="text-left py-2 font-medium" style={{ width: header.width }}>{header.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {openings.map((o) => {
                            const currentArea = (o.length * o.width * o.nos).toFixed(2);
                            
                            return (
                                <tr key={o.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50">
                                    
                                    {/* Type Selector (Includes Grill Window) */}
                                    <td className="py-2">
                                        <select 
                                            value={o.type} 
                                            onChange={(e) => updateOpeningGroup(o.id, 'type', e.target.value)}
                                            className="p-1 text-sm border rounded bg-white w-full"
                                        >
                                            <option value="Door">Door</option>
                                            <option value="Window">Window</option>
                                            <option value="Ventilator">Ventilator</option>
                                            <option value="Arch Opening">Arch Opening</option>
                                            <option value="Rectangular Opening">Rectangular Opening</option>
                                             <option value="Grill Window">Grill Works</option>
                                        </select>
                                    </td>
                                    
                                    {/* Width (L) Input */}
                                    <td>
                                        <input type="number" value={o.length || ''} onChange={(e) => updateOpeningGroup(o.id, 'length', e.target.value)} className="w-full p-1 text-sm border rounded text-center" placeholder="0.00" />
                                    </td>

                                    {/* Height (H) Input */}
                                    <td>
                                        <input type="number" value={o.width || ''} onChange={(e) => updateOpeningGroup(o.id, 'width', e.target.value)} className="w-full p-1 text-sm border rounded text-center" placeholder="0.00" />
                                    </td>

                                    {/* Number of Openings (Nos.) Input */}
                                    <td>
                                        <input type="number" value={o.nos || ''} onChange={(e) => updateOpeningGroup(o.id, 'nos', e.target.value)} className="w-full p-1 text-sm border rounded text-center font-bold bg-yellow-50" placeholder="1" />
                                    </td>

                                    {/* Wall Type/Thickness Dropdown (Dynamic) */}
                                    <td>
                                        <select 
                                            value={o.wallType} 
                                            onChange={(e) => updateOpeningGroup(o.id, 'wallType', e.target.value)}
                                            className={`p-1 text-sm border rounded bg-white w-full ${wallOptions.length <= 1 ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                            disabled={wallOptions.length <= 1}
                                        >
                                            {wallOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Calculated Area Display */}
                                    <td className="text-right font-bold text-red-600 pr-2">
                                        {currentArea}
                                    </td>
                                    
                                    {/* Delete Button */}
                                    <td className="text-center">
                                        <button onClick={() => removeOpeningGroup(o.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Total Opening Area Display */}
            <div className="flex justify-between mt-4">
                <p className="text-sm font-medium text-gray-600">Total Opening Area for Deduction: <span className="font-bold text-red-600">{totalOpeningArea} m²</span></p>
                
                {/* NEW: Total Grill Area Display */}
                {parseFloat(totalGrillArea) > 0 && (
                    <p className="text-sm font-medium text-gray-600 border border-green-200 bg-green-50 px-3 py-1 rounded">
                        Total Grill Area: <span className="font-bold text-green-700">{totalGrillArea} m²</span>
                    </p>
                )}
            </div>

            <button 
                onClick={addOpeningGroup} 
                className="mt-4 text-xs text-blue-600 font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded transition-colors border border-dashed border-blue-200"
            >
                <Plus size={14} /> Add New Group
            </button>
        </div>
    );
}