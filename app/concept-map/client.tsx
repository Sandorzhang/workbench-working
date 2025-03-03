'use client';

import React, { useState } from 'react';
import { ConceptMapView } from '@/components/concept-map/concept-map-view';
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';

export default function ConceptMapClient() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      {isFullscreen && (
        <div className="flex justify-end p-2 border-b">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <ConceptMapView 
          onFullscreen={!isFullscreen ? toggleFullscreen : undefined}
        />
      </div>
    </div>
  );
} 