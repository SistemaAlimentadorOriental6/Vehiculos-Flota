"use client"

import { motion } from "framer-motion"
import { Camera, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ImageData } from "@/components/dashboard/real-data-provider"
import ImageWithLoading from "@/components/image-with-loading"

interface LastCapturedVehicleProps {
  vehicleId: string
  vehicleName: string
  images: ImageData[]
  isLoading?: boolean
}

export default function LastCapturedVehicle({
  vehicleId,
  vehicleName,
  images,
  isLoading = false,
}: LastCapturedVehicleProps) {
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  // Mapear nombres de vistas a nombres más amigables
  const getViewName = (view: string): string => {
    const viewLower = view.toLowerCase()
    if (viewLower.includes("frontal")) return "Frontal"
    if (viewLower.includes("izquierdo")) return "Lateral Izquierdo"
    if (viewLower.includes("posterior")) return "Posterior"
    if (viewLower.includes("derecho")) return "Lateral Derecho"
    return view
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Último Vehículo Capturado</h3>

        <Button
          variant="outline"
          size="sm"
          className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900"
          asChild
        >
          <Link href={`/captura?id=${vehicleId}`}>
            <Camera className="h-4 w-4 mr-2" />
            Ver Vehículo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{vehicleName}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {vehicleId}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : images.length > 0 ? (
        <motion.div className="grid grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
          {images.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              className="relative rounded-lg overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-700"
            >
              <ImageWithLoading
                src={image.url || "/placeholder.svg"}
                alt={`Vista ${getViewName(image.view)}`}
                containerClassName="w-full h-full"
                fallbackText="No se pudo cargar la imagen"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2">
                <p className="text-white text-sm font-medium">{getViewName(image.view)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No hay imágenes disponibles</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Este vehículo aún no tiene imágenes capturadas</p>
        </div>
      )}
    </div>
  )
}

