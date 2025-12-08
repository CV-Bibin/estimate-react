import React from 'react';
import { Layers, FileText, Settings, UploadCloud } from 'lucide-react';

export default function Sidebar({ onUrlSubmit }) {
  const handleLoad = () => {
    // Hardcoded for testing, later we make this dynamic
    const testUrl = "https://app.speckle.systems/projects/YOUR_PROJECT_ID/models/YOUR_MODEL_ID";
    onUrlSubmit(testUrl);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Layers className="w-6 h-6" /> RvtEstimate
        </h1>
        <p className="text-xs text-gray-500 mt-1">Civil Engineering 5D BIM</p>
      </div>

      {/* Input Section */}
      <div className="p-6 flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Load Model
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Speckle URL..." 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button 
          onClick={handleLoad}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
        >
          <UploadCloud className="w-4 h-4" /> Load 3D Model
        </button>

        {/* Navigation Links */}
        <div className="mt-8 space-y-1">
          <NavItem icon={<FileText />} label="BOQ Estimate" active />
          <NavItem icon={<Layers />} label="Material Map" />
          <NavItem icon={<Settings />} label="Settings" />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        v1.0.0 • Built with React & Speckle
      </div>
    </div>
  );
}

// Helper Component for Menu Items
function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}