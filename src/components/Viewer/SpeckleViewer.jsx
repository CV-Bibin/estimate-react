import React, { useEffect, useRef } from 'react';
import { Viewer, DefaultViewerParams, SpeckleLoader } from '@speckle/viewer';

export default function SpeckleViewer({ streamUrl }) {
  const containerRef = useRef(null);

  useEffect(() => {
    async function init() {
      if (!containerRef.current) return;
      
      const viewer = new Viewer(containerRef.current, DefaultViewerParams);
      await viewer.init();

      // Use a public demo stream if none provided
      const actualUrl = streamUrl || "https://app.speckle.systems/projects/17498c4d2d/models/690833297a"; 
      
      const loader = new SpeckleLoader(viewer.getWorldTree(), actualUrl, "");
      await viewer.loadObject(loader, true);
    }
    init();
  }, [streamUrl]);

  return <div ref={containerRef} className="w-full h-full bg-gray-100" />;
}