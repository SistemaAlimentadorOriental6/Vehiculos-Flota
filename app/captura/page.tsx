"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationContainer } from "@/components/notification-toast"
import PremiumHeader from "@/components/premium-header"
import EnhancedPhotoGallery from "@/components/enhanced-photo-gallery"
import PhotoSummary from "@/components/photo-summary"
import EnhancedCameraInterface from "@/components/enhanced-camera-interface"
import ViewTransition from "@/components/view-transition"
import CongratulationsModal from "@/components/congratulations-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import ProtectedRoute from "@/components/auth/protected-route"
import VersionNotification from "@/components/version-notification"

export default function CapturaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vehicleIdFromUrl = searchParams.get("id")

  const [activeTab, setActiveTab] = useState(1)
  const [capturedPhotos, setCapturedPhotos] = useState<{ [key: number]: string }>({})
  const [showGallery, setShowGallery] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isChangingView, setIsChangingView] = useState(false)
  const [transitionData, setTransitionData] = useState<{ from: number; to: number } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)

  // Estado para la entrada del vehículo
  const [vehicleId, setVehicleId] = useState(vehicleIdFromUrl || "")
  const [showVehicleInput, setShowVehicleInput] = useState(!vehicleIdFromUrl)

  const { toast } = useToast()
  const { notifications, addNotification, removeNotification } = useNotifications()

  const tabs = [
    { id: 1, name: "Frontal" },
    { id: 2, name: "Izquierdo" },
    { id: 3, name: "Posterior" },
    { id: 4, name: "Derecho" },
  ]

  // Efecto para actualizar la URL cuando cambia el ID del vehículo
  useEffect(() => {
    if (vehicleId && !showVehicleInput) {
      router.push(`/captura?id=${vehicleId}`)
    }
  }, [vehicleId, showVehicleInput, router])

  // Manejar el envío del formulario de vehículo
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (vehicleId.trim().length > 0) {
      setShowVehicleInput(false)
      addNotification({
        title: "Vehículo registrado",
        message: `Iniciando captura para el vehículo #${vehicleId}`,
        type: "success",
      })
    } else {
      toast({
        title: "Error de validación",
        description: "Por favor ingrese un número de vehículo",
        variant: "destructive",
      })
    }
  }

  // Handle photo capture from camera
  const handlePhotoCapture = (photoData: string) => {
    // Store photo in state
    setCapturedPhotos((prev) => ({
      ...prev,
      [activeTab]: photoData,
    }))

    // Show appropriate notification
    if (editMode) {
      addNotification({
        title: "Foto actualizada",
        message: `Vista ${tabs.find((t) => t.id === activeTab)?.name} actualizada correctamente`,
        type: "success",
      })
      setEditMode(false)
    } else {
      addNotification({
        title: "Foto capturada",
        message: `Vista ${tabs.find((t) => t.id === activeTab)?.name} guardada correctamente`,
        type: "success",
      })

      // Auto-advance to next view if not the last one
      if (activeTab < 4) {
        setIsChangingView(true)
        setTransitionData({
          from: activeTab,
          to: activeTab + 1,
        })
      } else {
        // Show completion message if we've captured all views
        if (Object.keys(capturedPhotos).length === 4) {
          addNotification({
            title: "¡Documentación completa!",
            message: "Se han capturado las 4 vistas del vehículo",
            type: "success",
            duration: 5000,
          })
        }
      }
    }
  }

  // Handle photo deletion
  const handleDeletePhoto = (viewId: number) => {
    const newPhotos = { ...capturedPhotos }
    delete newPhotos[viewId]
    setCapturedPhotos(newPhotos)

    toast({
      title: "Foto eliminada",
      description: `La foto de vista ${tabs.find((t) => t.id === viewId)?.name} ha sido eliminada`,
    })
  }

  // Handle edit mode
  const handleEditPhoto = (viewId: number) => {
    setActiveTab(viewId)
    setEditMode(true)

    if (showGallery) setShowGallery(false)
    if (showSummary) setShowSummary(false)

    toast({
      title: "Modo edición",
      description: "Prepare la toma y presione el botón de captura cuando esté listo",
    })
  }

  // Handle transition between views
  const handleTransitionComplete = () => {
    if (transitionData) {
      setActiveTab(transitionData.to)
      setTransitionData(null)
      setIsChangingView(false)
    }
  }

  // Handle notifications from child components
  const handleNotification = (title: string, message: string, type: "success" | "error" | "info") => {
    addNotification({
      title,
      message,
      type,
      duration: type === "error" ? 5000 : 3000,
    })
  }

  // Handle successful save to server
  const handleSaveSuccess = () => {
    // Mostrar el modal de felicitaciones después de guardar exitosamente en el servidor
    setShowCongratulations(true)
  }

  // Auto show summary when all photos are captured
  const completedCount = Object.keys(capturedPhotos).length
  const isComplete = completedCount === 4

  useEffect(() => {
    if (isComplete && !showSummary && !showGallery && !editMode) {
      setTimeout(() => {
        setShowSummary(true)
      }, 800)
    }
  }, [capturedPhotos, showSummary, showGallery, editMode, isComplete])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 dark:text-white flex flex-col">
        <PremiumHeader />
        <VersionNotification />

        <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            {showVehicleInput ? (
              <motion.div
                key="vehicle-input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-6 text-center">Ingrese el número del vehículo</h2>
                  <form onSubmit={handleVehicleSubmit} className="space-y-6">
                    <div>
                      <Input
                        type="text"
                        placeholder="Ej: ABC123"
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
                        className="text-center text-xl font-bold tracking-wider"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    >
                      Iniciar Captura
                    </Button>
                  </form>
                </div>
              </motion.div>
            ) : showSummary ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                <PhotoSummary
                  photos={capturedPhotos}
                  vehicleId={vehicleId}
                  onClose={() => setShowSummary(false)}
                  onEdit={handleEditPhoto}
                  tabs={tabs}
                  onNotification={handleNotification}
                  onSaveSuccess={handleSaveSuccess}
                />
              </motion.div>
            ) : showGallery ? (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex-1 flex flex-col"
              >
                <EnhancedPhotoGallery
                  photos={capturedPhotos}
                  vehicleId={vehicleId}
                  onClose={() => setShowGallery(false)}
                  onDelete={handleDeletePhoto}
                  onEdit={handleEditPhoto}
                  tabs={tabs}
                />
              </motion.div>
            ) : (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <EnhancedCameraInterface
                  vehicleId={vehicleId}
                  activeView={activeTab}
                  onCapture={handlePhotoCapture}
                  onViewPhotos={() => setShowGallery(true)}
                  onSwitchView={(viewId) => {
                    if (editMode) {
                      if (confirm("¿Desea salir del modo edición? Los cambios no guardados se perderán.")) {
                        setEditMode(false)
                        setActiveTab(viewId)
                      }
                    } else {
                      setActiveTab(viewId)
                    }
                  }}
                />

                {isComplete && !editMode && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    <Button
                      onClick={() => setShowSummary(true)}
                      className="w-full rounded-xl py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Ver Resumen Completo
                    </Button>
                  </motion.div>
                )}

                {isChangingView && transitionData && (
                  <ViewTransition
                    fromView={transitionData.from}
                    toView={transitionData.to}
                    onComplete={handleTransitionComplete}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Notification container */}
        <NotificationContainer notifications={notifications} onDismiss={removeNotification} />

        {/* Congratulations modal */}
        <CongratulationsModal
          vehicleId={vehicleId}
          isOpen={showCongratulations}
          onClose={() => setShowCongratulations(false)}
        />
      </div>
    </ProtectedRoute>
  )
}
