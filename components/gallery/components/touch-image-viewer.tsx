"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, PanInfo } from "framer-motion"
import { ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TouchImageViewerProps {
  src: string
  alt: string
  zoomLevel: number
  rotation: number
  isFlippedHorizontally: boolean
  isFlippedVertically: boolean
  onDoubleTap: () => void
  onImageLoad: () => void
}

export default function TouchImageViewer({
  src,
  alt,
  zoomLevel,
  rotation,
  isFlippedHorizontally,
  isFlippedVertically,
  onDoubleTap,
  onImageLoad,
}: TouchImageViewerProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [lastTap, setLastTap] = useState(0)
  const [isPinching, setIsPinching] = useState(false)
  const [startDistance, setStartDistance] = useState(0)
  const [startZoom, setStartZoom] = useState(1)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Reset position when zoom or rotation changes
  useEffect(() => {
    if (zoomLevel === 1) {
      x.set(0)
      y.set(0)
    }
  }, [zoomLevel, rotation, x, y])
  
  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      onDoubleTap()
    }
    
    setLastTap(now)
  }
  
  const handlePan = (event: any, info: PanInfo) => {
    if (zoomLevel > 1) {
      // Only allow panning when zoomed in
      x.set(x.get() + info.delta.x)
      y.set(y.get() + info.delta.y)
    }
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture started
      setIsPinching(true)
      const dist = getDistanceBetweenTouches(e.touches)
      setStartDistance(dist)
      setStartZoom(zoomLevel)
    }
  }
  
  const getDistanceBetweenTouches = (touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0
    
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
    >
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="relative w-12 h-12 md:w-16 md:h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-green-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {src ? (
        <motion.div
          className="relative"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
          onTap={handleTap}
          onPan={handlePan}
          drag={zoomLevel > 1}
          dragConstraints={containerRef}
          dragElastic={0.1}
        >
          <motion.img
            ref={imageRef}
            src={src}
            alt={alt}
            className={cn(
              "max-h-[80vh] max-w-full object-contain transition-opacity duration-500 shadow-2xl touch-manipulation",
              imageLoading ? "opacity-0" : "opacity-100",
              isFlippedHorizontally ? "scale-x-[-1]" : "",
              isFlippedVertically ? "scale-y-[-1]" : "",
            )}
            style={{
              x,
              y,
            }}
            onLoad={() => {
              setImageLoading(false)
              onImageLoad()
            }}
            draggable="false"
          />
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
          <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-300">No se pudo cargar la imagen</p>
        </div>
      )}
    </div>
  )
}
