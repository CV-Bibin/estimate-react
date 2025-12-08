import React, { useState } from 'react';
import ProjectInfoForm from './components/Dashboard/ProjectInfoForm';
import ScopeBuilder from './components/Dashboard/ScopeBuilder';
import ManualEstimator from './components/Dashboard/ManualEstimator';
import SpeckleViewer from './components/Viewer/SpeckleViewer';

function App() {
  const [step, setStep] = useState(1); // 1:Info, 2:Scope, 3:Mode, 4:Work
  const [projectData, setProjectData] = useState({});
  const [scope, setScope] = useState([]);
  const [mode, setMode] = useState(null); // 'MANUAL' or 'RVT'

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          🏗️ RvtEstimate <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Beta</span>
        </h1>
        <div className="text-sm font-medium text-gray-500">
          Step <span className="text-black">{step}</span> of 4
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Step 1: Project Details */}
        {step === 1 && (
          <ProjectInfoForm onNext={(data) => { setProjectData(data); setStep(2); }} />
        )}
        
        {/* Step 2: Define Scope (Your New Code Loads Here) */}
        {step === 2 && (
          <ScopeBuilder onComplete={(items) => { setScope(items); setStep(3); }} />
        )}
        
        {/* Step 3: Choose Mode */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Estimation Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <button 
                  onClick={() => { setMode('MANUAL'); setStep(4); }} 
                  className="p-12 bg-white shadow-lg rounded-2xl hover:ring-4 ring-blue-500 border border-gray-100 transition-all group text-left"
               >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✍️</div>
                  <h3 className="text-xl font-bold mb-2">Manual Entry</h3>
                  <p className="text-gray-500">Enter L x B x D manually for each section. Best for traditional estimations.</p>
               </button>

               <button 
                  onClick={() => { setMode('RVT'); setStep(4); }} 
                  className="p-12 bg-white shadow-lg rounded-2xl hover:ring-4 ring-blue-500 border border-gray-100 transition-all group text-left"
               >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏗️</div>
                  <h3 className="text-xl font-bold mb-2">3D Model (Speckle)</h3>
                  <p className="text-gray-500">Upload a Revit/IFC model and extract quantities automatically.</p>
               </button>
            </div>
          </div>
        )}

        {/* Step 4: Execution */}
        {step === 4 && mode === 'MANUAL' && (
          <ManualEstimator workItems={scope} projectData={projectData} />
        )}
        {step === 4 && mode === 'RVT' && (
           <div className="h-[80vh] border rounded-xl overflow-hidden shadow-lg bg-white">
              <SpeckleViewer streamUrl={null} /> 
           </div>
        )}

      </div>
    </div>
  );
}

export default App;