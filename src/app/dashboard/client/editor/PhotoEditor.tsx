"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { BackgroundSelector } from "./BackgroundSelector";
import { PhotoPreview } from "./PhotoPreview";
import { PhotoUploader } from "./PhotoUploader";

const backgrounds = [
  "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578070181910-f1e514afdd08?q=80&w=1920&auto=format&fit=crop",
];

const defaultTransform = { scale: 1, x: 0, y: 0 };

export function PhotoEditor() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string>(
    backgrounds[0] ?? "",
  );
  const [transform, setTransform] = useState(defaultTransform);

  const handleReset = () => {
    setPhoto(null);
    setTransform(defaultTransform);
  };

  const handleTransformReset = () => {
    setTransform(defaultTransform);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="p-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            School Photo Editor
          </h1>
          <p className="mb-6 text-gray-600">
            Upload your child's school photo and customize the background. Drag
            to move and use the handle in the bottom-right corner to resize.
          </p>

          {!photo ? (
            <PhotoUploader onPhotoSelect={setPhoto} />
          ) : (
            <div className="space-y-6">
              <PhotoPreview
                photo={photo}
                background={selectedBackground}
                onTransformChange={setTransform}
                initialTransform={transform}
              />

              <div className="space-y-6">
                <BackgroundSelector
                  backgrounds={backgrounds}
                  selectedBackground={selectedBackground}
                  onBackgroundSelect={setSelectedBackground}
                />

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleTransformReset}
                    className="flex items-center rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset Position
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
