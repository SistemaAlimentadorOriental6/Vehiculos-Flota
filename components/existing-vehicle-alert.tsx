"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Camera, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getVehicleImages } from "@/lib/api-service"
import ImageWithLoading from "@/components/image-with-loading"

interface ExistingVehicleAlertProps {
  vehicleId: string
  onClose: () => void
  onViewGallery?: () => void
}

export default function ExistingVehicleAlert({ vehicleId, onClose, onViewGallery }: ExistingVehicleAlertProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasImages, setHasImages] = useState(false)
  const [previewImages, setPreviewImages] = useState<{ id: string; url: string; view: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicleImages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getVehicleImages(vehicleId)

        if (result.success && result.images && result.images.length > 0) {
          setHasImages(true)
          // Tomar hasta 4 imágenes para la vista previa
          setPreviewImages(
            result.images.slice(0, 4).map((img) => ({
              id: img.id,
              url: img.url,
              view: img.view,
            })),
          )
        } else {
          setHasImages(false)
          setPreviewImages([])
        }
      } catch (err) {
        console.error("Error al obtener imágenes del vehículo:", err)
        setError("No se pudieron cargar las imágenes del vehículo")
        setHasImages(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicleImages()
  }, [vehicleId])

  // Función para obtener un nombre de vista más amigable
  const getViewName = (view: string): string => {
    const viewLower = view.toLowerCase()
    if (viewLower.includes("frontal")) return "Frontal"
    if (viewLower.includes("izquierdo")) return "Lateral Izq."
    if (viewLower.includes("posterior")) return "Posterior"
    if (viewLower.includes("derecho")) return "Lateral Der."
    return view
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full h-8 w-8 bg-white/80 hover:bg-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 flex items-center">
              <div className="bg-white rounded-full p-3 mr-4 shadow-md">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Vehículo existente</h3>
                <p className="text-amber-100 text-sm">El vehículo #{vehicleId} ya tiene imágenes en el sistema</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Cargando imágenes existentes...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : hasImages ? (
              <>
                <p className="text-gray-600 mb-4">
                  Este vehículo ya tiene {previewImages.length} imágenes capturadas. Puedes continuar con la captura
                  para actualizar las imágenes existentes.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {previewImages.map((image) => (
                    <div key={image.id} className="relative rounded-lg overflow-hidden aspect-video bg-gray-100">
                      <ImageWithLoading
                        src={image.url || "/placeholder.svg"}
                        alt={`Vista ${getViewName(image.view)}`}
                        containerClassName="w-full h-full"
                        fallbackText="No se pudo cargar la vista"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                        <p className="text-white text-xs font-medium">{getViewName(image.view)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-blue-600 text-sm">
                  El vehículo existe en el sistema pero no tiene imágenes asociadas.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl py-5"
                asChild
              >
                <Link href={`/captura?id=${vehicleId}`}>
                  <Camera className="h-5 w-5 mr-2" />
                  Continuar con la captura
                </Link>
              </Button>

              {hasImages && onViewGallery && (
                <Button
                  variant="outline"
                  className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl py-3"
                  onClick={onViewGallery}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver galería completa
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

