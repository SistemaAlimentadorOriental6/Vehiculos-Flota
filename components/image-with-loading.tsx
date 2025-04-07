// Crear un nuevo componente para manejar la carga de imágenes con estados de carga y error

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ImageIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageWithLoadingProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  onLoad?: () => void
  onError?: () => void
  fallbackText?: string
}

export default function ImageWithLoading({
  src,
  alt,
  className = "",
  containerClassName = "",
  objectFit = "cover",
  onLoad,
  onError,
  fallbackText,
}: ImageWithLoadingProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Resetear estados cuando cambia la fuente
    setLoading(true)
    setError(false)

    // Log para depuración
    console.log("Cargando imagen:", src ? (src.length > 100 ? src.substring(0, 100) + "..." : src) : "undefined")
  }, [src])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
    onLoad?.()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    onError?.()
  }

  const handleRetry = () => {
    if (retryCount < 3) {
      setLoading(true)
      setError(false)
      setRetryCount((prev) => prev + 1)

      // Forzar recarga de la imagen añadiendo un timestamp
      const imgElement = document.getElementById(`img-${src.replace(/[^\w]/g, "-")}`) as HTMLImageElement
      if (imgElement) {
        const newSrc = src.includes("?") ? `${src}&retry=${Date.now()}` : `${src}?retry=${Date.now()}`
        imgElement.src = newSrc
      }
    }
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Imagen real (oculta durante carga) */}
      <img
        id={`img-${src ? src.substring(0, 20).replace(/[^\w]/g, "-") : "placeholder"}`}
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          `object-${objectFit}`,
          loading || error ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Estado de carga */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 animate-pulse">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mb-2" />
            <p className="text-xs text-gray-500">Cargando imagen...</p>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-gray-700 mb-2">{fallbackText || "No se pudo cargar la imagen"}</p>
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Placeholder mientras se carga */}
      {loading && !error && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300"
          animate={{
            background: ["linear-gradient(to right, #f0f0f0, #e0e0e0)", "linear-gradient(to right, #e0e0e0, #f0f0f0)"],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-300" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

