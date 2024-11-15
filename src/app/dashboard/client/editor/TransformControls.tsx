import React from 'react';
import { ZoomIn, ZoomOut, MoveHorizontal, RotateCcw } from 'lucide-react';

interface TransformControlsProps {
  scale: number;
  position: { x: number; y: number };
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onReset: () => void;
}

export function TransformControls({
  scale,
  position,
  onScaleChange,
  onPositionChange,
  onReset,
}: TransformControlsProps) {
  const handleScaleChange = (newScale: number) => {
    onScaleChange(Math.max(0.1, Math.min(3, newScale)));
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onPositionChange({
      ...position,
      [axis]: Math.max(-100, Math.min(100, value)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Scale</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScaleChange(scale - 0.1)}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {(scale * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => handleScaleChange(scale + 0.1)}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        <input
          type="range"
          min="10"
          max="300"
          value={scale * 100}
          onChange={(e) => handleScaleChange(Number(e.target.value) / 100)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Position</label>
          <MoveHorizontal className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Horizontal</label>
            <input
              type="range"
              min="-100"
              max="100"
              value={position.x}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Vertical</label>
            <input
              type="range"
              min="-100"
              max="100"
              value={position.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset Transform
      </button>
    </div>
  );
}