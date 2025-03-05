import React, { forwardRef, ReactNode } from 'react';

interface SvgFrameProps {
    width: number;
    height: number;
    title?: string;
    flexShrink?: number;
    children?: ReactNode;
}

export const SvgFrame = forwardRef<SVGSVGElement, SvgFrameProps>(({
    width,
    height,
    title,
    flexShrink = 0,
    children
}, ref) => {
    return (
        <div style={{ width, flexShrink }}>
            {title && <h3 className="text-center mb-2 font-medium">{title}</h3>}
            <svg
                ref={ref}
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
            >
                {children}
            </svg>
        </div>
    );
}); 