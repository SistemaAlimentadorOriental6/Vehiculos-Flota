"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Download, X } from "lucide-react"

interface DownloadIndicatorProps {
  fileName: string
  show: boolean
  onComplete: () => void
}

export default function DownloadIndicator({ fileName, show, onComplete }: DownloadIndicatorProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"downloading" | "completed" | "error">("downloading")

  // Simulate download progress
  useEffect(() => {
    if (!show) return

    setProgress(0)
    setStatus("downloading")

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15

        if (newProgress >= 100) {
          clearInterval(interval)
          setStatus("completed")
          // Auto dismiss after 2 seconds
          setTimeout(() => {
            onComplete()
          }, 2000)
          return 100
        }

        return newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {status === "downloading" ? (
                  <Download className="h-5 w-5 text-green-600 animate-pulse" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <h4 className="font-medium text-gray-800">
                  {status === "downloading" ? "Descargando..." : "Descarga completada"}
                </h4>
              </div>
              <button onClick={onComplete} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2">
              <p className="text-sm text-gray-500 truncate" title={fileName}>
                {fileName}
              </p>
            </div>

            <Progress value={progress} className="h-2 bg-gray-100" />

            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
              <span className="text-xs text-gray-500">{status === "completed" ? "Completado" : ""}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
