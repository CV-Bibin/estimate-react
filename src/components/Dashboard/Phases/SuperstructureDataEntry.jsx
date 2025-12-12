import React, { useState, useEffect } from 'react';
import { Hammer } from 'lucide-react';
import PlinthDataInput from '../Phases/PlinthDataInput'; 

export default function SuperstructureDataEntry({
  floorNames,
  globalParams,
  manualSuperstructureData,
  setManualSuperstructureData,
}) {
  const [activeFloorName, setActiveFloorName] = useState(floorNames[0]);
  const [floorStatus, setFloorStatus] = useState({});

  useEffect(() => {
    const initialStatus = floorNames.reduce((acc, name) => {
      acc[name] = !!manualSuperstructureData[name];
      return acc;
    }, {});
    setFloorStatus(initialStatus);
    setActiveFloorName(floorNames[0]);
  }, [floorNames, manualSuperstructureData]);

  const currentFloorData = manualSuperstructureData[activeFloorName] || {};

  // --- FETCH DATA FROM SUB STRUCTURE ---
  // Simple eval for "5+5" strings to get total numbers
  const evaluateMath = (val) => {
      try { return parseFloat(new Function('return ' + val)()) || 0; } catch (e) { return 0; }
  };

  const extLen = evaluateMath(globalParams.extLen);
  const intLen = evaluateMath(globalParams.intLen);
  
  const extWidth = parseFloat(globalParams.extWidth) || 0.23;
  const intWidth = parseFloat(globalParams.intWidth) || 0.23;

  // Pass the raw custom walls array directly
  const customWalls = globalParams.customWalls || [];

  const handleSaveFloorData = (dataToSave) => {
    const newSuperstructureData = {
      ...manualSuperstructureData,
      [activeFloorName]: dataToSave,
    };
    setManualSuperstructureData(newSuperstructureData);
    setFloorStatus((prev) => ({ ...prev, [activeFloorName]: true }));
    alert(`${activeFloorName} data saved successfully!`);
    
    const currentIndex = floorNames.indexOf(activeFloorName);
    if (currentIndex < floorNames.length - 1) {
      setActiveFloorName(floorNames[currentIndex + 1]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
        <Hammer size={20} /> Super Structure Data Entry
      </h3>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-100">
        {floorNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveFloorName(name)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center gap-2 ${
              activeFloorName === name
                ? "bg-orange-600 text-white"
                : floorStatus[name]
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {name} {floorStatus[name] && "✓"}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        <PlinthDataInput 
            floorName={activeFloorName}
            initialData={currentFloorData}
            
            // Pass Base Wall Data
            initialExt={{ l: extLen, b: extWidth }}
            initialInt={{ l: intLen, b: intWidth }}
            
            // Pass Full List of Custom Walls
            projectCustomWalls={customWalls}
            
            // Fallbacks for Opening Manager
            extWallWidth={extWidth}
            intWallWidth={intWidth}
            
            onSave={handleSaveFloorData}
        />
      </div>
    </div>
  );
}