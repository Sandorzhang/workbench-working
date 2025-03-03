declare module '@react-sigma/core' {
  import React from 'react';
  import { MultiDirectedGraph } from 'graphology';

  export interface SigmaProps {
    settings?: Record<string, any>;
    style?: React.CSSProperties;
    ref?: React.Ref<any>;
    children?: React.ReactNode;
  }

  export const SigmaContainer: React.FC<SigmaProps>;
  
  export interface ControlsContainerProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    children?: React.ReactNode;
  }
  
  export const ControlsContainer: React.FC<ControlsContainerProps>;
  export const ZoomControl: React.FC;
  export const FullScreenControl: React.FC;
  
  export interface Camera {
    animatedZoom: (params?: { duration?: number }) => void;
    animatedUnzoom: (params?: { duration?: number }) => void;
    ratio: number;
    x: number;
    y: number;
  }
  
  export interface SigmaInstance {
    getGraph: () => MultiDirectedGraph;
    getCamera: () => Camera;
    on: (event: string, callback: (event: any) => void) => void;
    removeAllListeners: () => void;
    refresh: () => void;
  }
  
  export function useSigma(): SigmaInstance;
} 