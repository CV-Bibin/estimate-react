import React from 'react';
import { BrickWall, Home, Grid, Trash2 } from 'lucide-react';
import WallRow from './WallRow'; 

export default function WallSchedule({
  extWall,
  intWall,
  customWalls,
  isGroundFloor,
  updateBaseWall,
  addWall,
  updateCustomWall,
  toggleCustomWallExempt,
  removeCustomWall,
  evaluateMath
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-100 p-3 border-b border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <BrickWall size={16} /> Wall Schedule
        </h4>
      </div>
      <div className="grid grid-cols-12 bg-gray-50 p-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
        <div className="col-span-4 pl-2">Name</div>
        <div className="col-span-2 text-center">Length</div>
        <div className="col-span-2 text-center">Width</div>
        <div className="col-span-2 text-center">Height</div>
        <div className="col-span-2 text-center">Status</div>
      </div>
      <div className="divide-y divide-gray-100">
        <WallRow
          label="Main Exterior Wall"
          data={extWall}
          onChange={(f, v) => updateBaseWall("extWall", f, v)}
          readOnlyLB={isGroundFloor}
          tag={isGroundFloor ? "Auto" : "Manual"}
          tagColor="bg-blue-100 text-blue-700"
          evaluateMath={evaluateMath}
        />
        <WallRow
          label="Main Interior Wall"
          data={intWall}
          onChange={(f, v) => updateBaseWall("intWall", f, v)}
          readOnlyLB={isGroundFloor}
          tag={isGroundFloor ? "Auto" : "Manual"}
          tagColor="bg-green-100 text-green-700"
          evaluateMath={evaluateMath}
        />
        {/* Custom Walls List */}
        {Array.isArray(customWalls) &&
          customWalls.map((w) => {
            if (!w) return null;
            return (
              <div
                key={w.id}
                className="grid grid-cols-12 gap-2 p-2 items-center bg-orange-50 border-b border-orange-100"
              >
                <div className="col-span-4">
                  <input
                    className="w-full p-1 border rounded text-xs font-bold"
                    value={w.name}
                    onChange={(e) =>
                      updateCustomWall(w.id, "name", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 relative group">
                  <input
                    type="text"
                    className="w-full p-1 border rounded text-center text-xs bg-white"
                    value={w.l}
                    onChange={(e) =>
                      updateCustomWall(w.id, "l", e.target.value)
                    }
                  />
                  {evaluateMath(w.l) !== parseFloat(w.l) && w.l !== "" && (
                    <div className="absolute top-full left-0 w-full text-center text-[9px] text-gray-500 bg-white border z-10 shadow-sm rounded">
                      = {evaluateMath(w.l).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    className="w-full p-1 border rounded text-center text-xs bg-white"
                    value={w.b}
                    onChange={(e) =>
                      updateCustomWall(w.id, "b", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    className="w-full p-1 border rounded text-center text-sm font-bold bg-white"
                    value={w.h}
                    onChange={(e) =>
                      updateCustomWall(w.id, "h", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 flex justify-center items-center gap-2">
                  <button
                    onClick={() => toggleCustomWallExempt(w.id)}
                    className={`text-[9px] px-2 py-0.5 rounded border font-bold ${
                      w.isPlinthExempt
                        ? "bg-red-100 text-red-700"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {w.isPlinthExempt ? "Not in Plinth" : "Standard"}
                  </button>
                  <button
                    onClick={() => removeCustomWall(w.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      <div className="p-2 border-t border-gray-100 bg-gray-50 flex gap-2">
        <button
          onClick={() => addWall("exterior")}
          className="flex-1 text-xs text-blue-700 border border-blue-200 bg-white font-bold py-2 rounded shadow-sm hover:bg-blue-50 transition-colors"
        >
          <Home className="inline mr-1" size={14} /> Add Ext. Wall
        </button>
        <button
          onClick={() => addWall("partition")}
          className="flex-1 text-xs text-green-700 border border-green-200 bg-white font-bold py-2 rounded shadow-sm hover:bg-green-50 transition-colors"
        >
          <Grid className="inline mr-1" size={14} /> Add Partition
        </button>
      </div>
    </div>
  );
}