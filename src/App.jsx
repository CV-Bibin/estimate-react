import React, { useState } from 'react';
import ProjectInfoForm from './components/Dashboard/ProjectInfoForm';
import ScopeBuilder from './components/Dashboard/ScopeBuilder';
import ManualEstimator from './components/Dashboard/ManualEstimator';
import SpeckleViewer from './components/Viewer/SpeckleViewer';
import ProjectSetup from './components/Dashboard/ProjectSetup';

function App() {
  const [step, setStep] = useState(1); // 1:Info, 2:Scope, 3:Mode, 4:Setup, 5:Work
  const [projectData, setProjectData] = useState({});
  const [scope, setScope] = useState([]); 
  
  // GLOBAL PARAMS (Columns, Dimensions)
  const [globalParams, setGlobalParams] = useState({
      extLen: '', intLen: '', 
      extWidth: 0.23, intWidth: 0.23,
      numFloors: 1, 
      floorNames: ['Ground Floor'],
      columnGroups: [], // Stores the columns
      openAreas: [],
      customWalls: []
  });

  const [mode, setMode] = useState(null); // 'MANUAL' or 'RVT'

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          🏗️ RvtEstimate <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Beta</span>
        </h1>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="hover:text-blue-600 underline">Back</button>}
          <span>Step <span className="text-black">{step}</span> of 5</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Step 1: Project Details */}
        {step === 1 && (
          <ProjectInfoForm onNext={(data) => { setProjectData(data); setStep(2); }} />
        )}
        
        {/* Step 2: Define Scope */}
        {step === 2 && (
          <ScopeBuilder onComplete={(items) => { setScope(items); setStep(3); }} />
        )}

        {/* Step 3: Choose Mode (MOVED HERE) */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Estimation Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <button 
                  onClick={() => { 
                      setMode('MANUAL'); 
                      setStep(4); // Go to Setup
                  }} 
                  className="p-12 bg-white shadow-lg rounded-2xl hover:ring-4 ring-blue-500 border border-gray-100 transition-all group text-left"
               >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✍️</div>
                  <h3 className="text-xl font-bold mb-2">Manual Entry</h3>
                  <p className="text-gray-500">Enter L x B x D manually for each section.</p>
               </button>

               <button 
                  onClick={() => { 
                      setMode('RVT'); 
                      setStep(5); // Skip Setup, go to Viewer
                  }} 
                  className="p-12 bg-white shadow-lg rounded-2xl hover:ring-4 ring-blue-500 border border-gray-100 transition-all group text-left"
               >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏗️</div>
                  <h3 className="text-xl font-bold mb-2">3D Model (Speckle)</h3>
                  <p className="text-gray-500">Upload a Revit/IFC model.</p>
               </button>
            </div>
          </div>
        )}

        {/* Step 4: Project Setup (MOVED HERE - Only for Manual) */}
        {step === 4 && mode === 'MANUAL' && (
          <div className="animate-fade-in">
             <div className="mb-4 text-center">
                 <h2 className="text-2xl font-bold text-gray-800">Project Dimensions</h2>
                 <p className="text-gray-500">Define your walls and columns here to enable auto-calculations.</p>
             </div>
             <ProjectSetup 
                globalParams={globalParams} 
                setGlobalParams={setGlobalParams} 
                onApply={() => setStep(5)} // Finish Setup -> Go to Estimator
             />
          </div>
        )}
        
        {/* Step 5: Execution */}
        {step === 5 && mode === 'MANUAL' && (
          <ManualEstimator 
            workItems={scope} 
            projectData={projectData} 
            // Pass the columns collected in Step 4
            projectConcealedColumns={globalParams.columnGroups || []} 
          />
        )}

        {step === 5 && mode === 'RVT' && (
           <div className="h-[80vh] border rounded-xl overflow-hidden shadow-lg bg-white">
              <SpeckleViewer streamUrl={null} /> 
           </div>
        )}

      </div>
    </div>
  );
}

export default App;