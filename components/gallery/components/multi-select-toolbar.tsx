"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"

interface MultiSelectToolbarProps {
  selectedCount: number
  onDownload: () => void
  onShare: () => void
  onCancel: () => void
}

export default function MultiSelectToolbar({ selectedCount, onDownload, onShare, onCancel }: MultiSelectToolbarProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    // Animate in when items are selected
    if (selectedCount > 0) {
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }, [selectedCount])

  return (
    <AnimatePresence>
      {showToolbar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`fixed ${isMobile ? "bottom-4 left-4 right-4" : "bottom-6 left-1/2 transform -translate-x-1/2"} z-50`}
        >
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-200">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1">
              {selectedCount} {selectedCount === 1 ? "seleccionada" : "seleccionadas"}
            </Badge>

            <div className="h-4 border-r border-gray-200 mx-1" />

            {isMobile ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50 flex-1"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span>Descargar</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50 flex-1"
                  onClick={onShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>Compartir</span>
                </Button>
              </>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50"
                        onClick={onDownload}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span>Descargar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar imágenes seleccionadas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50"
                        onClick={onShare}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        <span>Compartir</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compartir imágenes seleccionadas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <div className="h-4 border-r border-gray-200 mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
