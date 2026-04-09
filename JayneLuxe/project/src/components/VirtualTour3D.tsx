import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut, Maximize2, Play, Pause } from 'lucide-react';

interface VirtualTour3DProps {
  images: string[];
  propertyTitle: string;
  onClose: () => void;
}

export const VirtualTour3D = ({ images, propertyTitle, onClose }: VirtualTour3DProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const rotateRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const startAutoRotate = useCallback(() => {
    if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    const tick = () => {
      rotateRef.current.y += 0.3;
      setRotateY(rotateRef.current.y);
      autoRotateRef.current = requestAnimationFrame(tick);
    };
    autoRotateRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateRef.current) {
      cancelAnimationFrame(autoRotateRef.current);
      autoRotateRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoRotating) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
    return () => stopAutoRotate();
  }, [isAutoRotating, startAutoRotate, stopAutoRotate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newY = rotateRef.current.y + dx * 0.4;
    const newX = Math.max(-25, Math.min(25, rotateRef.current.x - dy * 0.3));
    rotateRef.current = { x: newX, y: newY };
    setRotateX(newX);
    setRotateY(newY);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAutoRotating(false);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    const newY = rotateRef.current.y + dx * 0.4;
    const newX = Math.max(-25, Math.min(25, rotateRef.current.x - dy * 0.3));
    rotateRef.current = { x: newX, y: newY };
    setRotateX(newX);
    setRotateY(newY);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    dragStart.current = null;
  };

  const handleReset = () => {
    setIsAutoRotating(false);
    rotateRef.current = { x: 0, y: 0 };
    setRotateX(0);
    setRotateY(0);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.6, prev - 0.2));

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    handleReset();
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    handleReset();
  };

  const normalizedY = rotateY % 360;
  const imageShift = Math.sin((normalizedY * Math.PI) / 180) * 6;
  const depthScale = 1 + Math.abs(Math.cos((normalizedY * Math.PI) / 180)) * 0.04;
  const shadowIntensity = Math.abs(Math.sin((normalizedY * Math.PI) / 180)) * 0.3;
  const highlightSide = normalizedY > -90 && normalizedY < 90 ? 'right' : 'left';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div>
          <h2 className="text-white font-bold text-lg">{propertyTitle}</h2>
          <p className="text-[#F3CF92] text-sm">3D Virtual Tour</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="text-white hover:text-[#F3CF92] transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ perspective: '1200px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative select-none transition-none"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${normalizedY}deg) scale(${depthScale * zoom})`,
            transformStyle: 'preserve-3d',
            width: isFullscreen ? '90vw' : 'min(800px, 90vw)',
            height: isFullscreen ? '85vh' : 'min(500px, 70vh)',
            willChange: 'transform',
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`Tour view ${currentIndex + 1}`}
            className="w-full h-full object-cover rounded-xl"
            style={{
              transform: `translateX(${imageShift}px)`,
              filter: `brightness(${1 - shadowIntensity * 0.15})`,
              backfaceVisibility: 'hidden',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `linear-gradient(to ${highlightSide}, rgba(255,255,255,${shadowIntensity * 0.12}), transparent 60%)`,
            }}
          />

          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: `inset ${highlightSide === 'right' ? '-' : ''}8px 0 20px rgba(0,0,0,${shadowIntensity * 0.4})`,
            }}
          />

          <div
            className="absolute -bottom-6 left-4 right-4 rounded-full pointer-events-none"
            style={{
              height: '30px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
              filter: 'blur(8px)',
              transform: `scaleY(0.3) translateY(100%) scaleX(${0.8 + shadowIntensity * 0.2})`,
            }}
          />
        </div>

        {showHint && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm animate-pulse pointer-events-none">
            Drag to rotate in 3D
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-4 px-6">
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); handleReset(); }}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex ? 'border-[#F3CF92] scale-110' : 'border-white/20 hover:border-white/50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleZoomOut}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all border border-white/20"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsAutoRotating(prev => !prev)}
            className={`p-2.5 rounded-full transition-all border ${
              isAutoRotating
                ? 'bg-[#F3CF92] text-[#134137] border-[#F3CF92]'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={isAutoRotating ? 'Pause rotation' : 'Auto rotate'}
          >
            {isAutoRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={handleReset}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all border border-white/20"
            title="Reset view"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleZoomIn}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all border border-white/20"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all border border-white/20"
            title="Toggle fullscreen view"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-3">
          Drag to rotate · Scroll thumbnails to navigate
        </p>
      </div>
    </div>
  );
};
