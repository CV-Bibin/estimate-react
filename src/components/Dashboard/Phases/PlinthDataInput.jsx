import React, { useState, useEffect } from 'react';
import { Save, Maximize2, Ruler, BrickWall, Trash2, Plus } from 'lucide-react';
import OpeningManager from './OpeningManager';

export default function PlinthDataInput({ floorName, initialData, extWallRef, intWallRef, extWallWidth, intWallWidth, onSave }) {
    
    // --- 1. STATE INITIALIZATION (Reverting to Perimeter Input) ---
    const [data, setData] = useState({
        plinthArea: initialData.plinthArea || '',
        // FIX 1: Explicitly tracking Perimeter input instead of Carpet Area input
        perimeter: initialData.perimeter || '', 
        
        extWallLength: initialData.extWallLength || extWallRef, 
        intWallLength: initialData.intWallLength || intWallRef, 
        
        openings: initialData.openings || [],
    });
    
    const [computedData, setComputedData] = useState({
        plasterArea: 0,
        brickQuantity: 0,
        // NEW: Field to hold the DERIVED carpet area
        derivedCarpetArea: 0, 
    });

    // --- 2. EFFECT HOOKS ---
    useEffect(() => {
        setData({
            plinthArea: initialData.plinthArea || '',
            // FIX 1: Set initial data for perimeter
            perimeter: initialData.perimeter || '',
            extWallLength: initialData.extWallLength || extWallRef,
            intWallLength: initialData.intWallLength || intWallRef,
            openings: initialData.openings || [],
        });
    }, [floorName, initialData, extWallRef, intWallRef]);

    // Compute Plaster/Brick Qty whenever relevant data changes
    useEffect(() => {
        const totalWallLength = parseFloat(data.extWallLength) + parseFloat(data.intWallLength) + data.openings.reduce((sum, o) => sum + (parseFloat(o.wallLengthOverride) || 0), 0);
        const totalOpeningArea = data.openings.reduce((sum, o) => sum + (parseFloat(o.length) * parseFloat(o.width) * (parseFloat(o.nos) || 0)), 0);
        const floorHeight = 3.0; // Assume 3.0m standard floor height
        
        // Use the new inputs for derivations
        const currentPlinthArea = parseFloat(data.plinthArea) || 0;
        const currentPerimeter = parseFloat(data.perimeter) || 0;
        const extW = parseFloat(extWallWidth) || 0.23;

        // DERIVATION 1: Wall Plastering Area
        const plasterArea = (currentPerimeter * floorHeight * 2) - totalOpeningArea;

        // DERIVATION 2: Estimated Carpet Area (Plinth Area - Wall Area Deduction)
        const estimatedWallArea = (currentPerimeter * extW);
        const derivedCarpetArea = (currentPlinthArea - estimatedWallArea);
        
        setComputedData({
            plasterArea: plasterArea > 0 ? plasterArea.toFixed(2) : '0.00',
            brickQuantity: (totalWallLength * floorHeight * extW).toFixed(2), 
            derivedCarpetArea: derivedCarpetArea > 0 ? derivedCarpetArea.toFixed(2) : '0.00', // NEW DERIVED VALUE
        });
    }, [data.extWallLength, data.intWallLength, data.openings, data.plinthArea, data.perimeter, extWallWidth]);


    // --- 3. RENDERING ---
    return (
        <div className="space-y-6">
            {/* BASE AREAS AND WALL LENGTHS */}
            <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                <h4 className="md:col-span-2 text-md font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><Ruler size={16}/> Core Floor Areas & Wall Lengths (Editable)</h4>
                
                {/* 1. Plinth Area Input */}
                <InputGroup label="Plinth Area (m²)" stateKey="plinthArea" value={data.plinthArea} onChange={setData} icon={Maximize2} />
                
                {/* 2. PLINTH PERIMETER INPUT (REPLACED CARPET AREA INPUT) */}
                <InputGroup label="Plinth Perimeter (m)" stateKey="perimeter" value={data.perimeter} onChange={setData} icon={Ruler} />
                
                {/* 3. Ext Wall Length (Refreshed from Sub Structure) */}
                <InputGroup label="Ext Wall Length (m)" stateKey="extWallLength" value={data.extWallLength} onChange={setData} icon={BrickWall} helpText={`Ref: ${extWallRef}m`} />
                
                {/* 4. Int Wall Length (Refreshed from Sub Structure) */}
                <InputGroup label="Int Wall Length (m)" stateKey="intWallLength" value={data.intWallLength} onChange={setData} icon={BrickWall} helpText={`Ref: ${intWallRef}m`} />
            </div>

            {/* DOOR AND OPENING MANAGER */}
            <OpeningManager 
                floorName={floorName}
                openings={data.openings}
                setOpenings={(newOpenings) => setData(prev => ({...prev, openings: newOpenings}))}
                // Pass the custom width props down to OpeningManager
                extWallWidth={extWallWidth}
                intWallWidth={intWallWidth}
            />

            {/* COMPUTED RESULTS AND SAVE */}
            <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="text-md font-bold text-gray-700 border-b pb-2 mb-4">Computed Quantities:</h4>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                    {/* DISPLAY DERIVED CARPET AREA */}
                    <ComputedDisplay label="Estimated Carpet Area" value={computedData.derivedCarpetArea} unit="m²" color="text-purple-600" />
                    
                    <ComputedDisplay label="Wall Plastering Area" value={computedData.plasterArea} unit="m²" color="text-red-600" />
                    <ComputedDisplay label="Brick Wall Quantity (Volume)" value={computedData.brickQuantity} unit="m³" color="text-green-600" />
                </div>

                <button 
                    onClick={() => handleSave(onSave, data, computedData)}
                    className="w-full mt-6 py-3 bg-orange-600 text-white rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={20}/> Save {floorName} Data
                </button>
            </div>
        </div>
    );
}

// --- Helper Components ---
// (InputGroup, ComputedDisplay, handleSave functions should be defined outside the component)
const InputGroup = ({ label, stateKey, value, onChange, icon: Icon, helpText }) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
            {Icon && <Icon size={14} />} {label}
        </label>
        <input 
            // FIX: Ensure type is 'number' for accurate input/formatting
            type="number"
            value={value}
            onChange={(e) => onChange(prev => ({...prev, [stateKey]: e.target.value}))}
            className="w-full p-2 border rounded-lg text-lg font-bold"
            placeholder="0"
        />
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

const ComputedDisplay = ({ label, value, unit, color }) => (
    <div className="bg-gray-100 p-3 rounded-lg border">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className={`text-xl font-extrabold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500">{unit}</p>
    </div>
);

const handleSave = (onSave, data, computedData) => {
    if (onSave) {
        onSave({ ...data, computed: computedData });
    }
};