import { ImagePlus } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

interface PhotoUploaderProps {
  onPhotoSelect: (photoDataUrl: string) => void;
}

export function PhotoUploader({ onPhotoSelect }: PhotoUploaderProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onPhotoSelect(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onPhotoSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
    >
      <input {...getInputProps()} />
      <ImagePlus className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <p className="mb-2 text-lg text-gray-600">
        {isDragActive ? "Drop your photo here" : "Drag & drop your photo here"}
      </p>
      <p className="text-sm text-gray-500">or click to select a file</p>
    </div>
  );
}
