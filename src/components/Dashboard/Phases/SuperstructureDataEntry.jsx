import React, { useState, useEffect } from "react";
import { Save, AlertCircle, Home, Hammer } from "lucide-react";
import PlinthDataInput from "../Phases/PlinthDataInput";
import OpeningManager from "./OpeningManager"; // NOTE: OpeningManager is assumed to be imported but PlinthDataInput uses it internally

// Structure to hold data for ALL floors
export default function SuperstructureDataEntry({
  floorNames,
  globalParams,
  manualSuperstructureData,
  setManualSuperstructureData,
}) {
  const [activeFloorName, setActiveFloorName] = useState(floorNames[0]);
  const [floorStatus, setFloorStatus] = useState({}); // To track if a floor is "Saved"

  useEffect(() => {
    // Initialize floor status based on floorNames
    const initialStatus = floorNames.reduce((acc, name) => {
      acc[name] = !!manualSuperstructureData[name]; // Check if data already exists
      return acc;
    }, {});
    setFloorStatus(initialStatus);
    setActiveFloorName(floorNames[0]);
  }, [floorNames, manualSuperstructureData]); // Added manualSuperstructureData to dependency array for reliable status update

  const currentFloorData = manualSuperstructureData[activeFloorName] || {}; // FETCH SUBSTRUCTURE WALL LENGTHS AND WIDTHS FOR REFERENCE
  const extWallRef = globalParams.extLen || "0";
  const intWallRef = globalParams.intLen || "0";

  // NEW: Pass the actual wall thicknesses down
  const extWallWidth = globalParams.extWidth || 0.23;
const intWallWidth = globalParams.intWidth || 0.15; 
  const handleSaveFloorData = (dataToSave) => {
    // 1. Save the new data into the global state map
    const newSuperstructureData = {
      ...manualSuperstructureData,
      [activeFloorName]: dataToSave,
    };
    setManualSuperstructureData(newSuperstructureData); // 2. Mark this floor as saved

    setFloorStatus((prev) => ({
      ...prev,
      [activeFloorName]: true,
    }));

    alert(`${activeFloorName} data saved successfully!`); // 3. Move to the next floor if available
    const currentIndex = floorNames.indexOf(activeFloorName);
    if (currentIndex < floorNames.length - 1) {
      setActiveFloorName(floorNames[currentIndex + 1]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-200">
      {" "}
      <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
        <Hammer size={20} /> Super Structure Data Entry
      </h3>
      {/* FLOOR NAVIGATION TABS */}{" "}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-100">
        {" "}
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
            {name} {floorStatus[name] && "✓"}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      <div className="animate-fade-in">
    <PlinthDataInput 
        floorName={activeFloorName}
        initialData={currentFloorData}
        extWallRef={extWallRef}
        intWallRef={intWallRef}
        // CRITICAL: Passing the widths
        extWallWidth={extWallWidth}
        intWallWidth={intWallWidth}
        onSave={handleSaveFloorData}
    />
</div>
    </div>
  );
}
