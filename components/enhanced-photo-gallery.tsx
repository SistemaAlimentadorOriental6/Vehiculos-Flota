"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Trash2,
  CheckCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { uploadPhoto, getViewFileName } from "@/lib/api-service"
import ImageWithLoading from "@/components/image-with-loading"

interface EnhancedPhotoGalleryProps {
  photos: { [key: number]: string }
  vehicleId: string
  onClose: () => void
  onDelete: (viewId: number) => void
  onEdit?: (viewId: number) => void
  tabs: { id: number; name: string }[]
}

export default function EnhancedPhotoGallery({
  photos,
  vehicleId,
  onClose,
  onDelete,
  onEdit,
  tabs,
}: EnhancedPhotoGalleryProps) {
  const [activePhotoId, setActivePhotoId] = useState<number | null>(
    Object.keys(photos).length > 0 ? Number.parseInt(Object.keys(photos)[0]) : null,
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [savingProgress, setSavingProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("carousel")

  const photoIds = Object.keys(photos).map((id) => Number.parseInt(id))
  const completedCount = photoIds.length
  const isComplete = completedCount === 4

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const handleNext = () => {
    if (!activePhotoId) return
    const currentIndex = photoIds.indexOf(activePhotoId)
    if (currentIndex < photoIds.length - 1) {
      setActivePhotoId(photoIds[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!activePhotoId) return
    const currentIndex = photoIds.indexOf(activePhotoId)
    if (currentIndex > 0) {
      setActivePhotoId(photoIds[currentIndex - 1])
    }
  }

  const confirmDelete = () => {
    if (activePhotoId) {
      onDelete(activePhotoId)
      setShowDeleteConfirm(false)

      // Seleccionar la siguiente foto disponible o cerrar si no hay más
      if (photoIds.length <= 1) {
        onClose()
      } else {
        const currentIndex = photoIds.indexOf(activePhotoId)
        if (currentIndex < photoIds.length - 1) {
          setActivePhotoId(photoIds[currentIndex + 1])
        } else {
          setActivePhotoId(photoIds[currentIndex - 1])
        }
      }
    }
  }

  const getViewName = (viewId: number) => {
    const tab = tabs.find((tab) => tab.id === viewId)
    return tab ? tab.name : "Desconocido"
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        const galleryElement = document.getElementById("photo-gallery-container")
        if (galleryElement) {
          await galleryElement.requestFullscreen()
        }
      } catch (err) {
        console.error("Error al entrar en modo pantalla completa:", err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      if (direction === "in") {
        return Math.min(prev + 0.25, 3)
      } else {
        return Math.max(prev - 0.25, 1)
      }
    })
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  // Nueva función para guardar la foto actual en el servidor con progreso
  const handleSaveCurrentPhoto = async () => {
    if (!activePhotoId) return

    setIsSaving(true)
    setSaveResult(null)
    setSavingProgress(0)

    try {
      const viewName = getViewFileName(activePhotoId)

      // Usar el callback de progreso
      const onProgress = (progress: number, status: "uploading" | "success" | "error") => {
        setSavingProgress(progress)
      }

      const result = await uploadPhoto(photos[activePhotoId], vehicleId, viewName, onProgress)

      setSaveResult({
        success: result.success,
        message: result.message,
      })

      setTimeout(() => {
        setSaveResult(null)
      }, 3000)
    } catch (error) {
      setSaveResult({
        success: false,
        message: "Error al guardar la foto en el servidor",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Variantes para animaciones
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  }

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const gridItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div
      id="photo-gallery-container"
      className={cn("flex flex-col h-full", isFullscreen ? "fixed inset-0 z-50 bg-black p-4" : "")}
    >
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-green-800 hover:bg-green-50 gap-1"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a captura
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
            {completedCount}/4 fotos
          </div>

          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 rounded-l-md border-r", viewMode === "carousel" ? "bg-gray-100" : "")}
              onClick={() => setViewMode("carousel")}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 rounded-r-md", viewMode === "grid" ? "bg-gray-100" : "")}
              onClick={() => setViewMode("grid")}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "carousel" ? (
          <AnimatePresence mode="wait">
            {activePhotoId ? (
              <motion.div
                key="photo-view"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="flex-1 flex flex-col"
              >
                <div className="relative bg-black rounded-xl overflow-hidden mb-4 aspect-[3/4]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageWithLoading
                      src={photos[activePhotoId] || "/placeholder.svg"}
                      alt={`Vista ${getViewName(activePhotoId)}`}
                      objectFit="contain"
                      containerClassName="w-full h-full"
                      fallbackText="No se pudo cargar la vista"
                      className={cn("transition-transform duration-300", zoomLevel !== 1 && "cursor-move")}
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>

                  <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg px-3 py-1.5 text-white text-sm font-medium backdrop-blur-sm">
                    {getViewName(activePhotoId)} - #{vehicleId}
                  </div>

                  {photoIds.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white"
                        onClick={handlePrevious}
                        disabled={photoIds.indexOf(activePhotoId) === 0}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, x: 2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white"
                        onClick={handleNext}
                        disabled={photoIds.indexOf(activePhotoId) === photoIds.length - 1}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.button>
                    </>
                  )}

                  {/* Controles de zoom y pantalla completa */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                      onClick={toggleFullscreen}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                      onClick={() => handleZoom("in")}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                      onClick={() => handleZoom("out")}
                      disabled={zoomLevel <= 1}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Indicador de zoom */}
                  {zoomLevel > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {zoomLevel.toFixed(2)}x
                    </div>
                  )}

                  {/* Panel de información */}
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 text-white"
                      >
                        <h4 className="font-bold mb-1">Información de la imagen</h4>
                        <p className="text-sm mb-1">Vista: {getViewName(activePhotoId)}</p>
                        <p className="text-sm mb-1">Vehículo: #{vehicleId}</p>
                        <p className="text-sm">Capturada localmente - No guardada en servidor</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mostrar resultado de guardar */}
                {saveResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-3 rounded-lg text-center ${
                      saveResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {saveResult.message}
                  </motion.div>
                )}

                {isSaving && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${savingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">Subiendo: {savingProgress}%</p>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl py-5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Eliminar
                  </Button>
                  {onEdit && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl py-5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => {
                        if (activePhotoId && onEdit) {
                          onEdit(activePhotoId)
                        }
                      }}
                    >
                      <Edit2 className="h-5 w-5 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button
                    className="flex-1 rounded-xl py-5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    onClick={handleSaveCurrentPhoto}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-photos"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl"
              >
                <Camera className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No hay fotos</h3>
                <p className="text-gray-500 mb-4">Aún no has capturado ninguna foto del vehículo</p>
                <Button
                  variant="outline"
                  className="rounded-xl border-green-200 text-green-700 hover:bg-green-50"
                  onClick={onClose}
                >
                  Comenzar captura
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <motion.div key="grid-view" variants={gridVariants} initial="hidden" animate="visible" className="flex-1">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {tabs.map((tab) => {
                const hasPhoto = !!photos[tab.id]
                return (
                  <motion.div
                    key={tab.id}
                    variants={gridItemVariants}
                    className={cn(
                      "relative rounded-xl overflow-hidden aspect-[3/4]",
                      hasPhoto ? "bg-black" : "bg-gray-100",
                    )}
                    onClick={() => hasPhoto && setActivePhotoId(tab.id) && setViewMode("carousel")}
                  >
                    {hasPhoto ? (
                      <>
                        <ImageWithLoading
                          src={photos[tab.id] || "/placeholder.svg"}
                          alt={`Vista ${getViewName(tab.id)}`}
                          containerClassName="w-full h-full"
                          fallbackText="No se pudo cargar la vista"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <div className="flex gap-2 mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onEdit) onEdit(tab.id)
                              }}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActivePhotoId(tab.id)
                                setShowDeleteConfirm(true)
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <Camera className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm text-center">Sin captura</p>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded">
                      {getViewName(tab.id)}
                    </div>
                    {hasPhoto && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl"
              >
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">Documentación completa</h3>
                    <p className="text-sm text-green-700">
                      Has capturado las 4 vistas del vehículo. Puedes guardarlas individualmente o todas juntas.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1 rounded-xl py-5 border-gray-200" onClick={onClose}>
                <Camera className="h-5 w-5 mr-2" />
                Volver a captura
              </Button>
              <Button
                className="flex-1 rounded-xl py-5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                onClick={() => setViewMode("carousel")}
              >
                <ChevronRight className="h-5 w-5 mr-2" />
                Ver en detalle
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("grid grid-cols-4 gap-2 mt-4", viewMode === "grid" ? "hidden" : "")}>
        {tabs.map((tab) => {
          const hasPhoto = !!photos[tab.id]
          return (
            <motion.button
              key={tab.id}
              onClick={() => hasPhoto && setActivePhotoId(tab.id)}
              whileHover={hasPhoto ? { y: -3, scale: 1.05 } : {}}
              whileTap={hasPhoto ? { scale: 0.95 } : {}}
              className={cn(
                "py-3 px-2 rounded-xl flex flex-col items-center justify-center relative transition-all",
                hasPhoto && activePhotoId === tab.id
                  ? "bg-green-100 text-green-700 shadow-md"
                  : hasPhoto
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed",
              )}
              disabled={!hasPhoto}
            >
              {hasPhoto && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                  hasPhoto && activePhotoId === tab.id
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                    : hasPhoto
                      ? "bg-green-200 text-green-700"
                      : "bg-gray-200 text-gray-400",
                )}
              >
                <span className="text-xs font-bold">{tab.id}</span>
              </div>
              <span className="text-xs">{tab.name}</span>
            </motion.button>
          )
        })}
      </div>

      {isComplete && viewMode === "carousel" && (
        <motion.div
          className="mt-6 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button className="w-full rounded-xl py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white">
            <CheckCircle className="h-5 w-5 mr-2" />
            Finalizar documentación
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">¿Eliminar foto?</h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro que deseas eliminar la foto de la vista{" "}
                  {activePhotoId ? getViewName(activePhotoId) : ""}? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDeleteConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" className="flex-1 rounded-xl" onClick={confirmDelete}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

