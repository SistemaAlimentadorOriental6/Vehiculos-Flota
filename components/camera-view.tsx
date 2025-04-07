"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Camera, Maximize2, Minimize2, ZoomIn, ZoomOut, Focus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CameraViewProps {
  onCapture: (photoData: string) => void
  onError: (error: string) => void
  activeView: number
  isEditing?: boolean
}

export default function CameraView({ onCapture, onError, activeView, isEditing = false }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [showCaptureButton, setShowCaptureButton] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFocusing, setIsFocusing] = useState(false)
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  const { toast } = useToast()
  // Mejorar la gestión de pantalla completa y orientación horizontal

  // Añadir estas funciones y estados para manejar la orientación
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  // Configuración de resolución para diferentes dispositivos
  const getIdealResolution = () => {
    // Detectar si es un dispositivo móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      return {
        width: { min: 1280, ideal: 1920, max: 3840 },
        height: { min: 720, ideal: 1080, max: 2160 },
      }
    } else {
      return {
        width: { min: 1280, ideal: 2560, max: 3840 },
        height: { min: 720, ideal: 1440, max: 2160 },
      }
    }
  }

  // Detectar la orientación del dispositivo
  useEffect(() => {
    const checkOrientation = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait")
      } else {
        setOrientation("landscape")
      }
    }

    // Comprobar al inicio
    checkOrientation()

    // Escuchar cambios de orientación
    window.addEventListener("resize", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
    }
  }, [])

  useEffect(() => {
    // Iniciar la cámara cuando el componente se monta
    startCamera()

    // Limpiar cuando el componente se desmonta
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Reiniciar la cámara cuando cambia la vista activa
  useEffect(() => {
    if (stream) {
      startCamera()
    }
  }, [activeView])

  // Manejar cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const startCamera = async () => {
    try {
      // Detener cualquier stream existente
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      setIsCameraReady(false)

      // Solicitar acceso a la cámara con configuración optimizada
      const resolution = getIdealResolution()
      const constraints = {
        video: {
          facingMode: facingMode,
          width: resolution.width,
          height: resolution.height,
          // Añadir soporte para zoom si está disponible
          advanced: [{ zoom: zoomLevel }],
        },
        audio: false,
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true)

          // Intentar aplicar configuraciones avanzadas si están disponibles
          try {
            const videoTrack = newStream.getVideoTracks()[0]
            const capabilities = videoTrack.getCapabilities()

            // Mostrar notificación sobre capacidades disponibles
            if (capabilities.zoom) {
              toast({
                title: "Zoom disponible",
                description: `Rango de zoom: ${capabilities.zoom.min}x - ${capabilities.zoom.max}x`,
                variant: "default",
                duration: 3000,
              })
            }
          } catch (err) {
            console.log("Capacidades avanzadas no disponibles", err)
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      onError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  // Modificar la función toggleFullscreen para mantener el estado
  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
      toast({
        title: "Error de pantalla completa",
        description: "Tu dispositivo no soporta el modo pantalla completa",
        variant: "destructive",
      })
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? Math.min(zoomLevel + 0.1, 3) : Math.max(zoomLevel - 0.1, 1)

    setZoomLevel(newZoom)

    // Intentar aplicar zoom si la API lo soporta
    try {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()

        if (capabilities.zoom) {
          const constraints = { advanced: [{ zoom: newZoom }] }
          videoTrack.applyConstraints(constraints)
        }
      }
    } catch (err) {
      console.log("Zoom no soportado", err)
    }
  }

  const handleFocus = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return

    // Calcular la posición relativa del clic
    const rect = videoRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setFocusPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsFocusing(true)

    // Intentar aplicar enfoque si la API lo soporta
    try {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()

        if (capabilities.focusMode && capabilities.focusDistance) {
          const constraints = {
            advanced: [
              { focusMode: "manual" },
              { focusDistance: x }, // Usar la posición X como aproximación
            ],
          }
          videoTrack.applyConstraints(constraints)
        }
      }
    } catch (err) {
      console.log("Enfoque manual no soportado", err)
    }

    // Mostrar animación de enfoque
    setTimeout(() => {
      setIsFocusing(false)
      setFocusPoint(null)
      setShowCaptureButton(true)
    }, 800)
  }

  const capturePhoto = () => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current

    // Configurar el canvas con las dimensiones del video para máxima calidad
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar el frame actual del video en el canvas
    const context = canvas.getContext("2d")
    if (context) {
      // Aplicar mejoras de imagen
      context.filter = "brightness(1.05) contrast(1.1)"
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      context.filter = "none"

      // Convertir a base64 con alta calidad
      const photoData = canvas.toDataURL("image/jpeg", 0.95)

      // Log para depuración
      console.log("Foto capturada en CameraView:", photoData.substring(0, 50) + "...")

      // Efecto de captura más elaborado
      setTimeout(() => {
        // Enviar la foto capturada después del efecto
        onCapture(photoData)

        // Terminar el efecto de flash
        setTimeout(() => {
          setIsCapturing(false)
          setShowCaptureButton(false)

          // Si estamos en pantalla completa, salir automáticamente
          if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => {
              console.error("Error exiting fullscreen:", err)
            })
          }
        }, 300)
      }, 200)
    }
  }

  // Modificar el return para adaptarse a la orientación
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-black",
        isFullscreen ? "fixed inset-0 z-50" : "",
        orientation === "landscape" ? "landscape-mode" : "",
      )}
    >
      <AnimatePresence>
        {!isCameraReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white">Iniciando cámara de alta resolución...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          facingMode === "user" ? "scale-x-[-1]" : "",
          isFullscreen ? "object-contain" : "object-cover",
        )}
        onClick={handleFocus}
        style={{
          transform: `scale(${zoomLevel})`,
          transition: "transform 0.3s ease",
        }}
      />

      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0] }}
            transition={{ duration: 0.5, times: [0, 0.1, 0.3, 1] }}
            className="absolute inset-0 bg-white z-20"
          />
        )}
      </AnimatePresence>

      {/* Animación de enfoque */}
      <AnimatePresence>
        {isFocusing && focusPoint && (
          <motion.div
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: [1, 0.8, 0], scale: [0.5, 1.2, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute z-20 w-12 h-12 border-2 border-yellow-400 rounded-full"
            style={{
              left: focusPoint.x - 24,
              top: focusPoint.y - 24,
            }}
          />
        )}
      </AnimatePresence>

      {/* Modificar la posición de los controles según la orientación */}
      <div
        className={cn(
          "absolute z-20 flex",
          isFullscreen || orientation === "landscape"
            ? "flex-col gap-2 right-4 top-1/2 transform -translate-y-1/2"
            : "flex-col gap-2 bottom-4 right-4",
        )}
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
          onClick={switchCamera}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
          onClick={() => handleZoom("in")}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
          onClick={() => handleZoom("out")}
          disabled={zoomLevel <= 1}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Indicador de zoom */}
      {zoomLevel > 1 && (
        <div className="absolute top-4 left-4 bg-black/40 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm z-20">
          {zoomLevel.toFixed(1)}x
        </div>
      )}

      {/* Instrucciones de enfoque */}
      {isCameraReady && !showCaptureButton && !isCapturing && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm z-20 flex items-center gap-1.5">
          <Focus className="h-3.5 w-3.5" />
          <span>Toca para enfocar</span>
        </div>
      )}

      {/* Modificar la posición del botón de captura según la orientación */}
      <AnimatePresence>
        {showCaptureButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={cn(
              "absolute z-20",
              isFullscreen || orientation === "landscape"
                ? "right-4 top-1/2 transform translate-y-16"
                : "bottom-4 left-1/2 transform -translate-x-1/2",
            )}
          >
            <Button
              size="lg"
              className={cn(
                "rounded-full shadow-lg flex items-center justify-center",
                orientation === "landscape" ? "w-14 h-14" : "w-16 h-16",
                isEditing ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-green-500 hover:bg-green-600 text-white",
              )}
              onClick={capturePhoto}
            >
              <Camera className={orientation === "landscape" ? "h-7 w-7" : "h-8 w-8"} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de modo pantalla completa */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 bg-black/40 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm z-20">
          Pantalla Completa
        </div>
      )}

      {/* Cuadro de encuadre */}
      {isCameraReady && !isCapturing && (
        <div className="absolute inset-0 border-4 border-white/20 pointer-events-none z-10">
          <div className="absolute top-0 left-0 border-t-2 border-l-2 border-white w-12 h-12"></div>
          <div className="absolute top-0 right-0 border-t-2 border-r-2 border-white w-12 h-12"></div>
          <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-white w-12 h-12"></div>
          <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-white w-12 h-12"></div>
        </div>
      )}
    </div>
  )
}

