"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Camera, Maximize2, ZoomIn, ZoomOut, Image, Crosshair } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import VehicleOutline from "@/components/vehicle-outline"

interface EnhancedCameraInterfaceProps {
  vehicleId: string
  activeView: number
  onCapture: (photoData: string) => void
  onViewPhotos: () => void
  onSwitchView?: (viewId: number) => void
  isFullscreenSupported?: boolean
}

export default function EnhancedCameraInterface({
  vehicleId,
  activeView,
  onCapture,
  onViewPhotos,
  onSwitchView,
  isFullscreenSupported = true,
}: EnhancedCameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [showCaptureButton, setShowCaptureButton] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFocusing, setIsFocusing] = useState(false)
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [cameraError, setCameraError] = useState<string | null>(null)

  const views = [
    { id: 1, name: "Frontal" },
    { id: 2, name: "Izquierdo" },
    { id: 3, name: "Posterior" },
    { id: 4, name: "Derecho" },
  ]

  // Get view description based on active view
  const getViewDescription = () => {
    switch (activeView) {
      case 1:
        return "Capture la parte delantera completa del vehículo"
      case 2:
        return "Capture el lado izquierdo completo del vehículo"
      case 3:
        return "Capture la parte trasera completa del vehículo"
      case 4:
        return "Capture el lado derecho completo del vehículo"
      default:
        return "Capture la vista completa del vehículo"
    }
  }

  // Configure resolution based on device
  const getIdealResolution = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    return isMobile
      ? { width: { min: 1280, ideal: 1920, max: 3840 }, height: { min: 720, ideal: 1080, max: 2160 } }
      : { width: { min: 1280, ideal: 2560, max: 3840 }, height: { min: 720, ideal: 1440, max: 2160 } }
  }

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait")
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)

    return () => window.removeEventListener("resize", checkOrientation)
  }, [])

  // Initialize camera
  useEffect(() => {
    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      setIsCameraReady(false)
      setCameraError(null)

      const resolution = getIdealResolution()
      const constraints = {
        video: {
          facingMode: facingMode,
          width: resolution.width,
          height: resolution.height,
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
          setShowCaptureButton(true)
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current || !isFullscreenSupported) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? Math.min(zoomLevel + 0.1, 3) : Math.max(zoomLevel - 0.1, 1)
    setZoomLevel(newZoom)

    try {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()

        if (capabilities.zoom) {
          videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] })
        }
      }
    } catch (err) {
      console.log("Zoom not supported on this device")
    }
  }

  const handleFocus = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return

    const rect = videoRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setFocusPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsFocusing(true)

    try {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()

        if (capabilities.focusMode) {
          videoTrack.applyConstraints({
            advanced: [{ focusMode: "manual" }],
          })
        }
      }
    } catch (err) {
      console.log("Manual focus not supported")
    }

    setTimeout(() => {
      setIsFocusing(false)
      setFocusPoint(null)
    }, 800)
  }

  const capturePhoto = () => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas to video dimensions for maximum quality
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")
    if (context) {
      // Apply image enhancements
      context.filter = "brightness(1.05) contrast(1.1)"
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      context.filter = "none"

      // Convert to high-quality JPEG
      const photoData = canvas.toDataURL("image/jpeg", 0.95)

      // Capture effect with timing
      setTimeout(() => {
        onCapture(photoData)

        setTimeout(() => {
          setIsCapturing(false)

          // Exit fullscreen after capture if active
          if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.error("Error exiting fullscreen:", err))
          }
        }, 300)
      }, 200)
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Camera Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative bg-black rounded-xl overflow-hidden aspect-[3/4] w-full",
          isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
          orientation === "landscape" && isFullscreen ? "landscape-mode" : "",
        )}
      >
        {/* Camera Loading State */}
        <AnimatePresence>
          {!isCameraReady && !cameraError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-white/90 text-center px-6">Iniciando cámara de alta resolución...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Error State */}
        {cameraError && (
          <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Error de cámara</h3>
            <p className="text-white/70 text-center mb-6">{cameraError}</p>
            <Button
              variant="outline"
              onClick={startCamera}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            facingMode === "user" ? "scale-x-[-1]" : "",
            isFullscreen ? "object-contain" : "object-cover",
          )}
          onClick={handleFocus}
          style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.3s ease" }}
        />

        {/* Vehicle Guideline Overlay */}
        {isCameraReady && !isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-40">
            <VehicleOutline view={activeView} />
          </div>
        )}

        {/* Canvas for Capturing (Hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash Effect */}
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

        {/* Focus Animation */}
        <AnimatePresence>
          {isFocusing && focusPoint && (
            <motion.div
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: [1, 0.8, 0], scale: [0.5, 1.2, 1.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute z-20 w-12 h-12 border-2 border-green-400 rounded-full"
              style={{
                left: focusPoint.x - 24,
                top: focusPoint.y - 24,
              }}
            />
          )}
        </AnimatePresence>

        {/* Camera Controls */}
        <div
          className={cn(
            "absolute z-20",
            isFullscreen
              ? "right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2"
              : "right-3 top-20 flex flex-col gap-2",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
            onClick={switchCamera}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {isFullscreenSupported && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
            onClick={() => handleZoom("in")}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Header Information */}
        <div className="absolute top-0 left-0 right-0 p-4 z-30 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-green-500 text-white rounded-full w-8 h-8 font-bold text-sm shadow-lg">
              {activeView}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg flex items-center">
                Vista {views.find((v) => v.id === activeView)?.name}
                <span className="text-green-400 ml-2">#{vehicleId}</span>
              </h2>
              <p className="text-white/70 text-xs">{getViewDescription()}</p>
            </div>
          </div>
        </div>

        {/* Zoom Indicator */}
        {zoomLevel > 1 && (
          <div className="absolute top-20 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded z-20">
            {zoomLevel.toFixed(1)}x
          </div>
        )}

        {/* Touch to Focus Instruction */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5">
          <Crosshair className="h-3 w-3" />
          <span>Toca para enfocar</span>
        </div>

        {/* Capture Button */}
        {showCaptureButton && isCameraReady && !cameraError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg border-4 border-white/30"
            >
              <Camera className="h-8 w-8 text-white" />
            </motion.button>
          </div>
        )}

        {/* Camera Frame Guide */}
        <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none z-10">
          <div className="absolute top-0 left-0 border-t-2 border-l-2 border-white w-8 h-8 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 border-t-2 border-r-2 border-white w-8 h-8 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-white w-8 h-8 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-white w-8 h-8 rounded-br-lg"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Button
          variant="outline"
          className="rounded-xl py-5 px-4 border-green-200 text-green-700 hover:bg-green-50 flex items-center justify-center"
          onClick={onViewPhotos}
        >
          <Image className="h-5 w-5 mr-2" />
          Ver Fotos
        </Button>

        <Button
          variant="outline"
          className="rounded-xl py-5 px-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center justify-center"
          onClick={toggleFullscreen}
          disabled={!isFullscreenSupported}
        >
          <Maximize2 className="h-5 w-5 mr-2" />
          Pantalla Completa
        </Button>

        <Button
          className="rounded-xl py-5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
          onClick={capturePhoto}
          disabled={!isCameraReady || !!cameraError}
        >
          <Camera className="h-5 w-5 mr-2" />
          Capturar
        </Button>
      </div>

      {/* View Selector Tabs */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {views.map((view) => (
          <motion.button
            key={view.id}
            onClick={() => onSwitchView && onSwitchView(view.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "py-3 px-2 rounded-xl flex flex-col items-center justify-center relative transition-all",
              activeView === view.id
                ? "bg-green-100 text-green-700 shadow-md"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                activeView === view.id
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                  : "bg-gray-200 text-gray-500",
              )}
            >
              <span className="text-xs font-bold">{view.id}</span>
            </div>
            <span className="text-xs">{view.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

