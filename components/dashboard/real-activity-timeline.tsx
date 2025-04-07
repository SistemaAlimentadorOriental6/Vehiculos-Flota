"use client"

import { motion } from "framer-motion"
import { Camera, Car, Clock, Upload } from "lucide-react"
import type { ActivityItem } from "@/components/dashboard/real-data-provider"

interface RealActivityTimelineProps {
  items: ActivityItem[]
  isLoading?: boolean
}

export default function RealActivityTimeline({ items, isLoading = false }: RealActivityTimelineProps) {
  // Función para renderizar el icono correcto
  const renderIcon = (action: string) => {
    const iconClasses = "h-5 w-5 text-green-500"

    switch (action) {
      case "guardado":
        return <Upload className={iconClasses} />
      case "capturado":
        return <Camera className={iconClasses} />
      default:
        return <Car className={iconClasses} />
    }
  }

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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Actividad Reciente</h3>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Actividad Reciente</h3>

      {items.length > 0 ? (
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          {items.map((item, index) => (
            <motion.div key={item.id} className="flex gap-3" variants={itemVariants}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                {renderIcon(item.action)}
              </div>

              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    Vehículo {item.vehicleId} {item.action}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.timeAgo}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {item.vehicleName && `${item.vehicleName} - `}
                  {item.folder && `Carpeta: ${item.folder}`}
                  {item.imageCount && ` - ${item.imageCount} imágenes`}
                </p>

                {index < items.length - 1 && (
                  <div className="ml-4 mt-1 mb-1 w-0.5 h-3 bg-gray-200 dark:bg-gray-700"></div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No hay actividad reciente</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            No se ha registrado actividad reciente en el sistema
          </p>
        </div>
      )}
    </div>
  )
}

