import React from "react";

export default function InputGroup({ label, value, onChange, icon: Icon, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-gray-400" />} {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 border border-gray-300 rounded-lg text-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}