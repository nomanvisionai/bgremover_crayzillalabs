/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface CompareSliderProps {
  originalUrl: string;
  processedUrl: string;
  bgColor?: string;
  bgType?: 'transparent' | 'color' | 'image';
  bgImageUrl?: string;
  className?: string;
}

export default function CompareSlider({
  originalUrl,
  processedUrl,
  bgColor = '#ffffff',
  bgType = 'transparent',
  bgImageUrl = '',
  className = '',
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Determine what style the background of the processed image should have
  const getProcessedBgStyle = (): React.CSSProperties => {
    if (bgType === 'transparent') {
      return {
        backgroundPosition: '0 0, 8px 8px',
        backgroundSize: '16px 16px',
        backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, white 25%, white 75%, #e5e7eb 75%, #e5e7eb)',
      };
    } else if (bgType === 'color') {
      return { backgroundColor: bgColor };
    } else if (bgType === 'image' && bgImageUrl) {
      return {
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  return (
    <div
      id="compare-slider-container"
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 shadow-inner ${className}`}
      style={{ aspectRatio: '4/3', width: '100%' }}
      onMouseDown={(e) => {
        // Prevent default text selection
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={() => {
        setIsDragging(true);
      }}
    >
      {/* Before Image (Left / Source) - occupies the whole canvas */}
      <div 
        id="bg-original-wrapper"
        className="absolute inset-0 h-full w-full bg-zinc-50"
      >
        <img
          id="compare-original-img"
          src={originalUrl}
          className="h-full w-full object-contain pointer-events-none"
          alt="Original"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-zinc-900/90 text-white font-mono text-[10px] uppercase tracking-wider shadow">
          Before
        </div>
      </div>

      {/* After Image (Right / Processed) - clipped based on slider position */}
      <div
        id="bg-processed-clipped-wrapper"
        className="absolute inset-0 h-full w-full transition-shadow duration-300"
        style={{
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
          ...getProcessedBgStyle(),
        }}
      >
        <img
          id="compare-processed-img"
          src={processedUrl}
          className="h-full w-full object-contain pointer-events-none"
          alt="Background Removed"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black text-white font-mono flex items-center gap-1 text-[10px] uppercase tracking-wider shadow">
          After
        </div>
      </div>

      {/* Draggable Divider Line */}
      <div
        id="slider-divider"
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center group"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Visual Handle */}
        <div className="w-8 h-8 rounded-full bg-white shadow-lg border border-zinc-300 flex items-center justify-center transition-transform duration-150 active:scale-95 group-hover:scale-105">
          <svg
            className="w-4 h-4 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l-4 4 4 4m8-8l4 4-4 4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
