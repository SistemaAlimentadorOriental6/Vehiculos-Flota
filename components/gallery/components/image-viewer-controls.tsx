"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Info,
  X,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface ImageViewerControlsProps {
  vehicleName: string
  imageName: string
  currentIndex: number
  totalImages: number
  zoomLevel: number
  onZoomIn: (e: React.MouseEvent) => void
  onZoomOut: (e: React.MouseEvent) => void
  onRotate: (e: React.MouseEvent) => void
  onToggleInfo: (e: React.MouseEvent) => void
  onDownload: (e: React.MouseEvent) => void
  onShare: (e: React.MouseEvent) => void
  onClose: (e: React.MouseEvent) => void
  onPrev: (e: React.MouseEvent) => void
  onNext: (e: React.MouseEvent) => void
  isFullscreen: boolean
  onToggleFullscreen: (e: React.MouseEvent) => void
}

export default function ImageViewerControls({
  vehicleName,
  imageName,
  currentIndex,
  totalImages,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleInfo,
  onDownload,
  onShare,
  onClose,
  onPrev,
  onNext,
  isFullscreen,
  onToggleFullscreen,
}: ImageViewerControlsProps) {
  return (
    <>
      {/* Header controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-800/60 backdrop-blur-md bg-black/60 z-20"
      >
        <div className="text-white">
          <h3 className="font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <Badge className="bg-green-600 text-white border-green-500 hover:bg-green-700">{vehicleName}</Badge>
            <span className="text-gray-200 truncate max-w-[100px] sm:max-w-full">{imageName}</span>
            <span className="text-xs sm:text-sm text-gray-400 ml-1 sm:ml-2">
              {currentIndex + 1} / {totalImages}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                  onClick={onZoomIn}
                >
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom In (+)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                  onClick={onZoomOut}
                >
                  <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom Out (-)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                  onClick={onRotate}
                >
                  <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rotate (R)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Hide less important controls on mobile */}
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                    onClick={onToggleInfo}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Show/Hide Info (I)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Download (D)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Hide share button on mobile to save space */}
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                    onClick={onShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Share (S)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle Fullscreen (F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all ml-1"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Close (Esc)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Navigation buttons */}
      {totalImages > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white z-10 hover:bg-black/70 group"
            onClick={onPrev}
          >
            <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white z-10 hover:bg-black/70 group"
            onClick={onNext}
          >
            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </>
      )}
    </>
  )
}
