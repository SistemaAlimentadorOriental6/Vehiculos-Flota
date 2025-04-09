"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageWithLoadingProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  fallbackText?: string
  onLoadComplete?: () => void
  preload?: boolean // New prop for preloading
}

export default function ImageWithLoading({
  src,
  alt,
  className,
  containerClassName,
  objectFit = "cover",
  fallbackText = "Imagen no disponible",
  onLoadComplete,
  preload,
}: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)

    // If preload is enabled, start loading immediately
    if (preload) {
      const img = new Image()
      img.onload = () => {
        setIsLoading(false)
        if (onLoadComplete) {
          onLoadComplete()
        }
      }
      img.onerror = () => {
        setIsLoading(false)
        setHasError(true)
      }
      img.src = src || "/placeholder.svg"
    }
  }, [src, preload, onLoadComplete])

  const handleLoad = () => {
    // Apply a smooth opacity transition
    const img = new Image()
    img.onload = () => {
      setIsLoading(false)
      if (onLoadComplete) {
        onLoadComplete()
      }
    }
    img.src = src
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={cn("relative w-full h-full", containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center p-2">
          {fallbackText}
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            {
              "object-cover": objectFit === "cover",
              "object-contain": objectFit === "contain",
              "object-fill": objectFit === "fill",
              "object-none": objectFit === "none",
              "object-scale-down": objectFit === "scale-down",
            },
            className,
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
