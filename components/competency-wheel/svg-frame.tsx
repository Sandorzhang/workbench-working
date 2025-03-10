import React, { forwardRef, ReactNode } from "react";

interface SvgFrameProps {
  width: number;
  height: number;
  title?: string;
  flexShrink?: number;
  children?: ReactNode;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const SvgFrame = forwardRef<SVGSVGElement, SvgFrameProps>(
  ({ width, height, title, children, containerRef }, ref) => {
    // 计算宽高比例
    const aspectRatio = width / height;

    return (
      <div ref={containerRef} className="w-full" style={{ maxWidth: "100%" }}>
        {title && <h3 className="text-center mb-2 font-medium">{title}</h3>}
        <svg
          ref={ref}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
          style={{ maxWidth: "100%", aspectRatio }}
        >
          {children}
        </svg>
      </div>
    );
  }
);

SvgFrame.displayName = "SvgFrame";
