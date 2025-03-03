'use client';

import React, { useState, useEffect } from 'react';
import { ConceptMapView } from '@/components/concept-map/concept-map-view';
import { Button } from '@/components/ui/button';
import { Minimize2, Network, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConceptMapClient() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-white p-4 shadow-sm rounded-2xl mr-6 border border-gray-100/80">
              <Network className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">大概念地图</h1>
              <p className="text-gray-500 mt-1.5 text-sm font-normal">探索学科知识结构与概念关系</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
              onClick={toggleFullscreen}
            >
              <Plus className="h-4 w-4 mr-2" />
              新建地图
            </Button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="flex justify-end p-2 border-b">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            <div className="flex-1 min-h-[500px]">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <ConceptMapView 
            onFullscreen={!isFullscreen ? toggleFullscreen : undefined}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
} 