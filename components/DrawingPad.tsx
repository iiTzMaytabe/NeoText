import React, { useEffect, useState, useCallback } from 'react';
import { Point, DrawingPadProps } from '../types';

const DrawingPad: React.FC<DrawingPadProps> = ({ className, forwardRef, isProcessing }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Helper to get coordinates relative to canvas
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): Point | null => {
    const canvas = forwardRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      if (event.touches.length === 0) return null;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent | MouseEvent).clientX;
      clientY = (event as React.MouseEvent | MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (isProcessing) return;
    const point = getCoordinates(event);
    if (point) {
      setIsDrawing(true);
      setLastPoint(point);
    }
  };

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isProcessing || !lastPoint) return;
    
    // Prevent scrolling on touch devices while drawing
    if ('touches' in event) {
        // We handle preventDefault in the passive listener setup in useEffect if needed, 
        // but React synthetic events don't support passive false easily for touchmove.
        // We'll rely on CSS touch-action: none.
    }

    const point = getCoordinates(event);
    if (!point) return;

    const ctx = forwardRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#06b6d4'; // Cyan color
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.stroke();

    setLastPoint(point);
  }, [isDrawing, isProcessing, lastPoint, forwardRef]);

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  useEffect(() => {
    const canvas = forwardRef.current;
    if (!canvas) return;

    // Resize canvas to match display size for sharp rendering
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Restore context settings after resize resets them
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#000000'; // Make sure background is black for better contrast if we save it
            // Actually, transparent is better for UI, but for AI we might want black bg with white text?
            // Let's stick to transparent bg on UI, but when exporting we can composite.
            // For now, let's just clear.
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [forwardRef]);

  return (
    <canvas
      ref={forwardRef}
      className={`touch-none cursor-crosshair ${className}`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};

export default DrawingPad;