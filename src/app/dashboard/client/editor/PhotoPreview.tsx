import React, { useCallback, useEffect, useRef, useState } from "react";

interface PhotoPreviewProps {
  photo: string;
  background: string;
  onTransformChange: (transform: {
    scale: number;
    x: number;
    y: number;
  }) => void;
  initialTransform?: { scale: number; x: number; y: number };
}

export function PhotoPreview({
  photo,
  background,
  onTransformChange,
  initialTransform = { scale: 1, x: 0, y: 0 },
}: PhotoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef(initialTransform);
  const dragRef = useRef({ active: false, startX: 0, startY: 0 });
  const resizeRef = useRef({ active: false, startX: 0, startY: 0, corner: "" });
  const rafRef = useRef<number>();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const updateTransform = useCallback(() => {
    if (imageRef.current) {
      const { scale, x, y } = transformRef.current;
      imageRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  }, []);

  const commitTransform = useCallback(() => {
    onTransformChange(transformRef.current);
  }, [onTransformChange]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      active: true,
      startX: e.clientX - transformRef.current.x,
      startY: e.clientY - transformRef.current.y,
    };
  }, []);

  const handleResizeStart = useCallback(
    (
      e: React.MouseEvent,
      corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    ) => {
      e.preventDefault();
      setIsResizing(true);
      resizeRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        corner,
      };
    },
    [],
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container || !dragRef.current.active) return;

      const maxOffset = container.offsetWidth * 0.3;
      const newX = Math.max(
        -maxOffset,
        Math.min(maxOffset, e.clientX - dragRef.current.startX),
      );
      const newY = Math.max(
        -maxOffset,
        Math.min(maxOffset, e.clientY - dragRef.current.startY),
      );

      transformRef.current = {
        ...transformRef.current,
        x: newX,
        y: newY,
      };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(updateTransform);
    },
    [updateTransform],
  );

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!resizeRef.current.active || !imageRef.current) return;

      const { startX, startY, corner } = resizeRef.current;
      const rect = imageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const startDistance = Math.hypot(startX - centerX, startY - centerY);
      const currentDistance = Math.hypot(
        e.clientX - centerX,
        e.clientY - centerY,
      );
      const scale = currentDistance / startDistance;

      let newScale = transformRef.current.scale * scale;
      newScale = Math.max(0.5, Math.min(2, newScale));

      transformRef.current = {
        ...transformRef.current,
        scale: newScale,
      };

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(updateTransform);
    },
    [updateTransform],
  );

  const handleDragEnd = useCallback(() => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      setIsDragging(false);
      commitTransform();
    }
  }, [commitTransform]);

  const handleResizeEnd = useCallback(() => {
    if (resizeRef.current.active) {
      resizeRef.current.active = false;
      setIsResizing(false);
      commitTransform();
    }
  }, [commitTransform]);

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("mouseup", handleResizeEnd);

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleDrag, handleResize, handleDragEnd, handleResizeEnd]);

  useEffect(() => {
    transformRef.current = initialTransform;
    updateTransform();
  }, [initialTransform, updateTransform]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[3/4] w-full max-w-2xl select-none overflow-hidden rounded-lg shadow-lg"
    >
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={`absolute inset-0 ${
          isDragging ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
        }`}
        onMouseDown={handleDragStart}
      >
        <div
          ref={imageRef}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `translate(${transformRef.current.x}px, ${transformRef.current.y}px) scale(${transformRef.current.scale})`,
          }}
        >
          <img
            src={photo}
            alt="Student"
            className="absolute inset-0 h-full w-full object-contain will-change-transform"
          />

          {/* Bounding box */}
          <div className="pointer-events-none absolute inset-0 border-2 border-white">
            {/* Corner handles */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map(
              (corner) => (
                <div
                  key={corner}
                  className={`absolute h-4 w-4 rounded-full bg-white cursor-${corner}-resize pointer-events-auto ${corner
                    .split("-")
                    .map((pos) => `${pos}-0`)
                    .join(" ")} transition-transform hover:scale-125`}
                  onMouseDown={(e) => handleResizeStart(e, corner)}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
