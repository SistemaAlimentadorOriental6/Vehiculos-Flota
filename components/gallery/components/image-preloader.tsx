"use client"

import { useEffect } from "react"

interface ImagePreloaderProps {
  urls: string[]
  onProgress?: (percent: number) => void
  onComplete?: () => void
}

/**
 * Component to preload a batch of images in the background
 */
export default function ImagePreloader({ urls = [], onProgress, onComplete }: ImagePreloaderProps) {
  useEffect(() => {
    if (!urls || urls.length === 0) {
      if (onComplete) onComplete()
      return
    }

    let loadedCount = 0
    const totalImages = urls.length

    urls.forEach((url) => {
      if (!url) {
        // Skip undefined or null URLs
        loadedCount++
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = img.onerror = () => {
        loadedCount++

        if (onProgress) {
          const percent = Math.round((loadedCount / totalImages) * 100)
          onProgress(percent)
        }

        if (loadedCount === totalImages && onComplete) {
          onComplete()
        }
      }

      img.src = url
    })
  }, [urls, onProgress, onComplete])

  // This component doesn't render anything visible
  return null
}
