import React, { useState, useEffect } from 'react';
import { Hammer } from 'lucide-react';
import PlinthDataInput from '../Phases/PlinthDataInput'; 

export default function SuperstructureDataEntry({
  floorNames,
  globalParams,
  manualSuperstructureData,
  setManualSuperstructureData,
  projectConcealedColumns = []
}) {
  const [activeFloorName, setActiveFloorName] = useState(floorNames[0]);
  const [floorStatus, setFloorStatus] = useState({});

  useEffect(() => {
    const initialStatus = floorNames.reduce((acc, name) => {
      acc[name] = !!manualSuperstructureData[name];
      return acc;
    }, {});
    setFloorStatus(initialStatus);
    // Removed setActiveFloorName(floorNames[0]) from here to prevent reset on every data change
  }, [floorNames]);

  const currentFloorData = manualSuperstructureData[activeFloorName] || {};

  const evaluateMath = (val) => {
      try { 
        if(!val) return 0;
        return parseFloat(new Function('return ' + val)()) || 0; 
      } catch (e) { return 0; }
  };

  const extLen = evaluateMath(globalParams.extLen);
  const intLen = evaluateMath(globalParams.intLen);
  const extWidth = parseFloat(globalParams.extWidth) || 0.23;
  const intWidth = parseFloat(globalParams.intWidth) || 0.23;
  const customWalls = globalParams.customWalls || [];
  const openAreas = globalParams.openAreas || [];

  // --- IMPROVED SAVE & JUMP LOGIC ---
  const handleSaveFloorData = (dataToSave) => {
    // 1. Update the data
    const newSuperstructureData = {
      ...manualSuperstructureData,
      [activeFloorName]: dataToSave,
    };
    setManualSuperstructureData(newSuperstructureData);

    // 2. Mark floor as completed
    setFloorStatus((prev) => ({ ...prev, [activeFloorName]: true }));

    // 3. Automated Jump (No Alert to prevent blocking)
    const currentIndex = floorNames.indexOf(activeFloorName);
    if (currentIndex < floorNames.length - 1) {
      const nextFloor = floorNames[currentIndex + 1];
      
      // Delay switch slightly to ensure state is committed
      setTimeout(() => {
        setActiveFloorName(nextFloor);
        // Scroll to top of the new floor entry
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
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
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeFloorName === name
                ? "bg-orange-600 text-white shadow-lg"
                : floorStatus[name]
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
            }`}
          >
            {name} {floorStatus[name] && "✓"}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={activeFloorName}>
        <PlinthDataInput 
            floorName={activeFloorName}
            initialData={currentFloorData}
            initialExt={{ l: extLen, b: extWidth }}
            initialInt={{ l: intLen, b: intWidth }}
            projectCustomWalls={customWalls}
            projectOpenAreas={openAreas}
            projectConcealedColumns={projectConcealedColumns}
            extWallWidth={extWidth}
            intWallWidth={intWidth}
            onSave={handleSaveFloorData}
        />
      </div>
    </div>
  );
}