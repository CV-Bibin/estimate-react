import React, { useState } from 'react';
import { ChevronRight, Building, User, MapPin } from 'lucide-react';

export default function ProjectInfoForm({ onNext }) {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    siteLocation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100 mt-10">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Project Initiation</h2>
        <p className="text-gray-500 mt-1">Enter the details to appear on the final report.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
                name="projectName" 
                onChange={handleChange} 
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 ring-blue-500 outline-none transition-all" 
                placeholder="e.g. Kerala Modern Villa Renovation" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
            <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                    name="clientName" 
                    onChange={handleChange} 
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 ring-blue-500 outline-none transition-all" 
                    placeholder="e.g. Mr. John Doe"
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Location</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                    name="siteLocation" 
                    onChange={handleChange} 
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 ring-blue-500 outline-none transition-all" 
                    placeholder="e.g. Kochi, Ernakulam"
                />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button 
          onClick={() => onNext(formData)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform hover:translate-y-[-1px]"
        >
          Next Step <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}