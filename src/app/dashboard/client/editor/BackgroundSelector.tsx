import React from 'react';

interface BackgroundSelectorProps {
  backgrounds: string[];
  selectedBackground: string;
  onBackgroundSelect: (background: string) => void;
}

export function BackgroundSelector({
  backgrounds,
  selectedBackground,
  onBackgroundSelect,
}: BackgroundSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Choose Background:</h3>
      <div className="grid grid-cols-3 gap-4">
        {backgrounds.map((bg, index) => (
          <button
            key={index}
            onClick={() => onBackgroundSelect(bg)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all
              ${bg === selectedBackground ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent hover:border-gray-300'}`}
          >
            <img src={bg} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}