"use client"

import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, RotateCw, Download, Share2, Info, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MobileImageControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onRotate: () => void
  onDownload: () => void
  onShare: () => void
  onInfo: () => void
  onClose: () => void
  showInfo: boolean
}

export default function MobileImageControls({
  onZoomIn,
  onZoomOut,
  onRotate,
  onDownload,
  onShare,
  onInfo,
  onClose,
  showInfo,
}: MobileImageControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className="bg-black/70 backdrop-blur-md rounded-full p-1.5 flex items-center shadow-xl border border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onRotate}
        >
          <RotateCw className="h-5 w-5" />
        </Button>
        
        <div className="h-6 border-l border-white/20 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onInfo}
        >
          <Info className={`h-5 w-5 ${showInfo ? "text-green-400" : "text-white"}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onDownload}
        >
          <Download className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
        
        <div className="h-6 border-l border-white/20 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}
