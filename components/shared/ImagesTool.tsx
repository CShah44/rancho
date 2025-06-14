import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageItem {
  imageUrl: string;
  title: string;
}

const ImagesTool = ({ images }: { images: ImageItem[] }) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const openModal = (image: ImageItem) => {
    setSelectedImage(image);
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      // Reset position if zooming out to 1 or below
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    // Reset position when rotating
    setPosition({ x: 0, y: 0 });
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  // Reset position when zoom level changes to 1
  useEffect(() => {
    if (zoomLevel <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  return (
    <div className="my-3 sm:my-4">
      {/* Responsive Thumbnail Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
        {images.map((image) => (
          <div
            key={image.imageUrl}
            className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl cursor-pointer group bg-zinc-800/50"
            onClick={() => openModal(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end">
              <div className="p-2 sm:p-3 w-full bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs sm:text-sm truncate font-medium">
                  {image.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            {/* Image container with zoom, rotation and panning */}
            <div
              ref={imageContainerRef}
              className={cn(
                "relative overflow-hidden flex items-center justify-center",
                zoomLevel > 1 ? "cursor-grab" : "cursor-default",
                isDragging && zoomLevel > 1 ? "cursor-grabbing" : ""
              )}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                }}
              >
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  width={800}
                  height={600}
                  className="max-h-[70vh] sm:max-h-[80vh] w-auto h-auto object-contain select-none"
                  priority
                  draggable={false}
                />
              </div>
            </div>

            {/* Responsive Controls */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 sm:gap-2 bg-zinc-800/90 rounded-full px-3 sm:px-4 py-2 backdrop-blur-sm">
              <button
                onClick={handleZoomOut}
                className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 text-white transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="text-white text-xs sm:text-sm font-medium px-2">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                onClick={handleZoomIn}
                className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 text-white transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-px h-4 sm:h-6 bg-zinc-600 mx-1"></div>
              <button
                onClick={handleRotate}
                className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-700 text-white transition-colors"
                aria-label="Rotate image"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-zinc-800/90 text-white hover:bg-zinc-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Image title */}
            <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-zinc-800/90 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm max-w-[80vw]">
              <p className="text-white text-xs sm:text-sm font-medium truncate">
                {selectedImage.title}
              </p>
            </div>

            {/* Pan instruction - only show when zoomed */}
            {zoomLevel > 1 && (
              <div className="absolute top-12 sm:top-16 left-1/2 transform -translate-x-1/2 bg-zinc-800/70 rounded-full px-2 sm:px-3 py-1 backdrop-blur-sm opacity-70">
                <p className="text-white text-xs">Drag to pan</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesTool;
