import React from "react";

export default function WallRow({
  label,
  data,
  onChange,
  readOnlyLB,
  tag,
  tagColor,
  evaluateMath,
}) {
  return (
    <div className="grid grid-cols-12 gap-2 p-2 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50">
      <div className="col-span-4 pl-2 text-xs font-bold text-gray-700">
        {label}
      </div>
      <div className="col-span-2 relative group">
        {readOnlyLB ? (
          <div className="text-center text-xs text-gray-500 py-1 bg-gray-100 rounded">
            {parseFloat(data.l).toFixed(2)}
          </div>
        ) : (
          <input
            type="text"
            className="w-full p-1 border border-blue-200 rounded text-center text-xs font-bold text-blue-700 bg-blue-50"
            value={data.l}
            onChange={(e) => onChange("l", e.target.value)}
            placeholder="e.g. 5+3"
          />
        )}
        {!readOnlyLB &&
          evaluateMath &&
          evaluateMath(data.l) !== parseFloat(data.l) &&
          data.l !== "" && (
            <div className="absolute top-full left-0 w-full text-center text-[9px] text-gray-500 bg-white border z-10 shadow-sm rounded">
              = {evaluateMath(data.l).toFixed(2)}
            </div>
          )}
      </div>
      <div className="col-span-2">
        {readOnlyLB ? (
          <div className="text-center text-xs text-gray-500 py-1 bg-gray-100 rounded">
            {parseFloat(data.b).toFixed(2)}
          </div>
        ) : (
          <input
            type="number"
            className="w-full p-1 border border-blue-200 rounded text-center text-xs font-bold text-blue-700 bg-blue-50"
            value={data.b}
            onChange={(e) => onChange("b", e.target.value)}
            placeholder="B"
          />
        )}
      </div>
      <div className="col-span-2">
        <input
          type="number"
          className="w-full p-1 border rounded text-center text-sm font-bold bg-white"
          value={data.h}
          onChange={(e) => onChange("h", e.target.value)}
        />
      </div>
      <div className="col-span-2 flex justify-center">
        <span className={`text-[9px] px-2 py-0.5 rounded border ${tagColor}`}>
          {tag}
        </span>
      </div>
    </div>
  );
}