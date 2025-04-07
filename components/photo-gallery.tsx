"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, CheckCircle, Camera, ChevronLeft, ChevronRight, Edit2, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { uploadPhoto, getViewFileName } from "@/lib/api-service"
import ImageWithLoading from "@/components/image-with-loading"

interface PhotoGalleryProps {
  photos: { [key: number]: string }
  vehicleId: string
  onClose: () => void
  onDelete: (viewId: number) => void
  onEdit?: (viewId: number) => void
  tabs: { id: number; name: string }[]
}

export default function PhotoGallery({ photos, vehicleId, onClose, onDelete, onEdit, tabs }: PhotoGalleryProps) {
  const [activePhotoId, setActivePhotoId] = useState<number | null>(
    Object.keys(photos).length > 0 ? Number.parseInt(Object.keys(photos)[0]) : null,
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [savingProgress, setSavingProgress] = useState(0)

  const photoIds = Object.keys(photos).map((id) => Number.parseInt(id))
  const completedCount = photoIds.length
  const isComplete = completedCount === 4

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

  return (
    <div className="flex flex-col h-full">
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

        <div className="text-sm font-medium text-gray-700">{completedCount}/4 fotos</div>
      </motion.div>

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
              <ImageWithLoading
                src={photos[activePhotoId] || "/placeholder.svg"}
                alt={`Vista ${getViewName(activePhotoId)}`}
                objectFit="contain"
                containerClassName="w-full h-full"
                fallbackText="No se pudo cargar la vista"
              />

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

      <div className="grid grid-cols-4 gap-2 mt-4">
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

      {isComplete && (
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
                  ¿Estás seguro que deseas eliminar la foto de la vista {getViewName(activePhotoId)}? Esta acción no se
                  puede deshacer.
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

