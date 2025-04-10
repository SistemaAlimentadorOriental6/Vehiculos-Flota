"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ChevronRight, ZoomIn, X, ChevronDown, Calendar, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ImageData } from "@/components/dashboard/real-data-provider"
import ImageWithLoading from "@/components/image-with-loading"
import { cn } from "@/lib/utils"

// Hook simple para detectar dispositivos móviles
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para actualizar el estado basado en el ancho de la ventana
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Verificar inicialmente
    checkIsMobile()

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkIsMobile)

    // Limpiar
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

interface LastCapturedVehicleProps {
  vehicleId: string
  vehicleName: string
  images: ImageData[]
  isLoading?: boolean
  captureDate?: string
}

export default function LastCapturedVehicle({
  vehicleId,
  vehicleName,
  images,
  isLoading = false,
  captureDate = new Date().toISOString(),
}: LastCapturedVehicleProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useIsMobile() // Usar nuestro hook personalizado

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
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

  // Formatear fecha
  const formattedDate = (() => {
    const date = new Date(captureDate)
    return {
      date: date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  })()

  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden",
        "transition-all duration-300 ease-in-out",
        isExpanded ? "p-0" : "p-6",
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      {/* Visor de imagen a pantalla completa */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center p-4">
              <div className="text-white">
                <h3 className="text-lg font-medium">{vehicleName}</h3>
                <p className="text-sm text-gray-300">{getViewName(selectedImage.view)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
                <ImageWithLoading
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={`Vista ${getViewName(selectedImage.view)}`}
                  containerClassName="w-full h-full"
                  imageClassName="object-contain w-full h-full"
                  fallbackText="No se pudo cargar la imagen"
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 p-4">
              {images.map((img, index) => (
                <Button
                  key={img.id}
                  variant={img.id === selectedImage.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "border-white/20 text-white",
                    img.id === selectedImage.id ? "bg-green-600 hover:bg-green-700" : "bg-black/50 hover:bg-black/70",
                  )}
                  onClick={() => setSelectedImage(img)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
          isExpanded ? "p-6 pb-2" : "mb-6",
        )}
      >
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Último Vehículo Capturado</h3>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-gray-500 dark:text-gray-400 hover:bg-transparent p-1 h-auto"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "transform rotate-180" : "")} />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-300"
          asChild
        >
          <Link href={`/captura?id=${vehicleId}`}>
            <Camera className="h-4 w-4 mr-2" />
            Ver Vehículo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Vista compacta */}
      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{vehicleName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {vehicleId}</p>
                </div>
                <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formattedDate.date}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {formattedDate.time}
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              // Esqueletos de carga
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-[4/3]">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : images.length > 0 ? (
              // Grid de imágenes
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    variants={itemVariants}
                    className="relative rounded-lg overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-700 group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ImageWithLoading
                      src={image.url || "/placeholder.svg"}
                      alt={`Vista ${getViewName(image.view)}`}
                      containerClassName="w-full h-full"
                      imageClassName="transition-transform duration-300 group-hover:scale-105"
                      fallbackText="No se pudo cargar la imagen"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2 flex justify-between items-center">
                      <p className="text-white text-sm font-medium">{getViewName(image.view)}</p>
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Estado vacío
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl"
                  />
                  <Camera className="relative h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No hay imágenes disponibles
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Este vehículo aún no tiene imágenes capturadas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900"
                  asChild
                >
                  <Link href={`/captura?id=${vehicleId}`}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar Ahora
                  </Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista expandida */}
      {isExpanded && !isLoading && images.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-gray-100 dark:border-gray-700">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative aspect-square cursor-pointer group overflow-hidden",
                  "border-b md:border-r border-gray-100 dark:border-gray-700",
                  (index + 1) % (isMobile ? 1 : 2) === 0 && "md:border-r-0",
                  (index + 1) % 4 === 0 && "lg:border-r-0",
                )}
                onClick={() => setSelectedImage(image)}
              >
                <ImageWithLoading
                  src={image.url || "/placeholder.svg"}
                  alt={`Vista ${getViewName(image.view)}`}
                  containerClassName="w-full h-full"
                  imageClassName="object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackText="No se pudo cargar la imagen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium mb-1">{getViewName(image.view)}</p>
                  <p className="text-white/80 text-xs">{vehicleName}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">{vehicleName}</h4>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate.date} • {formattedDate.time}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900"
              asChild
            >
              <Link href={`/captura?id=${vehicleId}`}>
                <Camera className="h-4 w-4 mr-2" />
                Ver Detalles
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
