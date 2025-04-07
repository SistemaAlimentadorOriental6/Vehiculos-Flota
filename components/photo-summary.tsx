"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit2,
  Share2,
  CheckCircle,
  Camera,
  RefreshCw,
  X,
  Save,
  Upload,
  Clock,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { uploadAllPhotos, uploadPhoto } from "@/lib/api-service"
import { Progress } from "@/components/ui/progress"
import ImageWithLoading from "@/components/image-with-loading"

interface PhotoSummaryProps {
  photos: { [key: number]: string }
  vehicleId: string
  onClose: () => void
  onEdit: (viewId: number) => void
  tabs: { id: number; name: string }[]
  onNotification?: (title: string, message: string, type: "success" | "error" | "info") => void
  onSaveSuccess?: () => void
}

// Interfaz para el estado de carga de cada foto
interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error"
  progress: number
  message?: string
  startTime?: number
  endTime?: number
}

export default function PhotoSummary({
  photos,
  vehicleId,
  onClose,
  onEdit,
  tabs,
  onNotification = () => {},
  onSaveSuccess = () => {},
}: PhotoSummaryProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)

  // Nuevo estado para rastrear el progreso de carga de cada foto
  const [uploadStatus, setUploadStatus] = useState<{ [key: number]: UploadStatus }>({})

  const getViewName = (viewId: number) => {
    const tab = tabs.find((tab) => tab.id === viewId)
    return tab ? tab.name : "Desconocido"
  }

  const getViewFileName = (viewId: number) => {
    const tab = tabs.find((tab) => tab.id === viewId)
    return tab ? tab.name.replace(" ", "_").toLowerCase() : "desconocido"
  }

  const handleSaveIndividualPhoto = async (viewId: number) => {
    if (!photos[viewId]) return

    // Inicializar estado para esta foto específica
    setUploadStatus((prev) => ({
      ...prev,
      [viewId]: {
        status: "uploading",
        progress: 0,
        startTime: Date.now(),
      },
    }))

    try {
      // Función de callback para esta foto específica
      const onProgress = (progress: number, status: "uploading" | "success" | "error", message?: string) => {
        setUploadStatus((prev) => ({
          ...prev,
          [viewId]: {
            status,
            progress,
            message,
            startTime: prev[viewId]?.startTime || Date.now(),
            endTime: status === "success" || status === "error" ? Date.now() : undefined,
          },
        }))
      }

      const viewName = getViewFileName(viewId)
      const result = await uploadPhoto(photos[viewId], vehicleId, viewName, onProgress)

      if (result.success) {
        onNotification("Foto guardada", `Vista ${getViewName(viewId)} guardada correctamente en el servidor`, "success")
      } else {
        onNotification("Error al guardar", result.message, "error")
      }
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        [viewId]: {
          ...prev[viewId],
          status: "error",
          progress: 100,
          message: error instanceof Error ? error.message : "Error inesperado",
          endTime: Date.now(),
        },
      }))

      onNotification(
        "Error al guardar",
        `Ocurrió un error inesperado al guardar la foto: ${error instanceof Error ? error.message : "Error desconocido"}`,
        "error",
      )
    }
  }

  const handleDownload = () => {
    setIsDownloading(true)

    // Simulamos la descarga
    setTimeout(() => {
      setIsDownloading(false)
    }, 2000)
  }

  const handleShare = () => {
    setIsSharing(true)

    // Simulamos el compartir
    setTimeout(() => {
      setIsSharing(false)
    }, 2000)
  }

  // Función para calcular el tiempo transcurrido en formato legible
  const getElapsedTime = (startTime?: number, endTime?: number): string => {
    if (!startTime) return "0s"

    const end = endTime || Date.now()
    const elapsed = end - startTime

    if (elapsed < 1000) return `${elapsed}ms`
    if (elapsed < 60000) return `${(elapsed / 1000).toFixed(1)}s`

    const minutes = Math.floor(elapsed / 60000)
    const seconds = ((elapsed % 60000) / 1000).toFixed(0)
    return `${minutes}m ${seconds}s`
  }

  // Nueva función para guardar todas las fotos en el servidor con seguimiento de progreso
  const handleSaveToServer = async () => {
    if (Object.keys(photos).length !== 4) {
      onNotification("Faltan fotos", "Se requieren las 4 vistas del vehículo para guardar", "error")
      return
    }

    setIsSaving(true)
    setSaveSuccess(null)

    // Inicializar el estado de carga para cada foto
    const initialStatus: { [key: number]: UploadStatus } = {}
    Object.keys(photos).forEach((key) => {
      const viewId = Number.parseInt(key)
      initialStatus[viewId] = {
        status: "idle",
        progress: 0,
        startTime: undefined,
        endTime: undefined,
      }
    })

    setUploadStatus(initialStatus)

    try {
      // Función de callback para actualizar el progreso
      const onProgress = (
        viewId: number,
        progress: number,
        status: "uploading" | "success" | "error",
        message?: string,
      ) => {
        setUploadStatus((prev) => ({
          ...prev,
          [viewId]: {
            status,
            progress,
            message,
            startTime: prev[viewId]?.startTime || (status === "uploading" && progress === 0 ? Date.now() : undefined),
            endTime: status === "success" || status === "error" ? Date.now() : undefined,
          },
        }))
      }

      const result = await uploadAllPhotos(photos, vehicleId, onProgress)

      if (result.success) {
        setSaveSuccess(true)
        onNotification("Guardado exitoso", "Todas las fotos se guardaron correctamente en el servidor", "success")

        // Llamar al callback de éxito después de un breve retraso para permitir que se muestre la notificación
        setTimeout(() => {
          onSaveSuccess()
        }, 1000)
      } else {
        setSaveSuccess(false)
        onNotification("Error al guardar", result.message, "error")
      }
    } catch (error) {
      setSaveSuccess(false)
      onNotification("Error al guardar", "Ocurrió un error inesperado al guardar las fotos", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-green-800 hover:bg-green-50 gap-1"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a captura
        </Button>

        <div className="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Documentación completa
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-green-800">Resumen de Capturas</h2>
        <p className="text-gray-500">Vehículo #{vehicleId}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {tabs.map((tab) => {
          const hasPhoto = !!photos[tab.id]
          const status = uploadStatus[tab.id]
          const isUploading = status?.status === "uploading"
          const isSuccess = status?.status === "success"
          const isError = status?.status === "error"
          const showUploadStatus = isUploading || isSuccess || isError

          return (
            <motion.div
              key={tab.id}
              className="relative rounded-xl overflow-hidden aspect-[3/4] bg-gray-100 shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPhoto(tab.id)}
            >
              {hasPhoto ? (
                <>
                  <ImageWithLoading
                    src={photos[tab.id] || "/placeholder.svg"}
                    alt={`Vista ${getViewName(tab.id)}`}
                    containerClassName="w-full h-full"
                    fallbackText="No se pudo cargar la vista"
                  />

                  {/* Overlay de estado de carga */}
                  {showUploadStatus && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center p-4">
                      {isUploading && (
                        <>
                          <Clock className="h-8 w-8 text-white mb-2 animate-pulse" />
                          <p className="text-white text-center font-medium mb-2">Subiendo...</p>
                          <Progress value={status.progress} className="w-full h-2 mb-2" />
                          <p className="text-white/80 text-xs">Tiempo: {getElapsedTime(status.startTime)}</p>
                        </>
                      )}

                      {isSuccess && (
                        <>
                          <CheckCircle className="h-10 w-10 text-green-400 mb-2" />
                          <p className="text-white text-center font-medium mb-1">¡Subida exitosa!</p>
                          <p className="text-white/80 text-xs">
                            Tiempo total: {getElapsedTime(status.startTime, status.endTime)}
                          </p>
                        </>
                      )}

                      {isError && (
                        <>
                          <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
                          <p className="text-white text-center font-medium mb-1">Error al subir</p>
                          <p className="text-white/80 text-xs text-center">
                            {status.message || "Ocurrió un error durante la carga"}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(tab.id)
                        }}
                        disabled={isUploading}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500/50 border-green-400/30 text-white hover:bg-green-600/50 flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveIndividualPhoto(tab.id)
                        }}
                        disabled={isUploading}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Sin captura</p>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded">
                {getViewName(tab.id)}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-lg w-full max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithLoading
                src={photos[selectedPhoto] || "/placeholder.svg"}
                alt={`Vista ${getViewName(selectedPhoto)}`}
                objectFit="contain"
                className="rounded-xl"
                containerClassName="w-full h-full"
                fallbackText="No se pudo cargar la imagen en tamaño completo"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 border-white/20 text-white hover:bg-black/70 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(selectedPhoto)
                    setSelectedPhoto(null)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mostrar mensaje de éxito o error después de guardar */}
      {saveSuccess !== null && !isSaving && (
        <div
          className={`mb-4 p-3 rounded-lg text-center ${
            saveSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {saveSuccess
            ? "Las fotos se guardaron correctamente en el servidor"
            : "Ocurrió un error al guardar las fotos en el servidor"}
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="rounded-xl py-6 border-green-200 text-green-700 hover:bg-green-50 flex items-center justify-center"
          onClick={handleShare}
          disabled={isSharing || isSaving}
        >
          {isSharing ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Compartiendo...
            </>
          ) : (
            <>
              <Share2 className="h-5 w-5 mr-2" />
              Compartir
            </>
          )}
        </Button>

        <Button
          className="rounded-xl py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
          onClick={handleSaveToServer}
          disabled={isSaving || isDownloading}
        >
          {isSaving ? (
            <>
              <Upload className="h-5 w-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Guardar en Servidor
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

