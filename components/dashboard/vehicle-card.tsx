"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Car, Camera, Eye, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ImageWithLoading from "@/components/image-with-loading"
import { cn } from "@/lib/utils"
import type { VehicleData } from "./real-data-provider"

interface VehicleCardProps {
  vehicle: VehicleData
  onView: (id: string) => void
}

export default function VehicleCard({ vehicle, onView }: VehicleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Función para obtener el texto según el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "pending":
        return "Pendiente"
      default:
        return "Desconocido"
    }
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {vehicle.thumbnail ? (
          <ImageWithLoading
            src={vehicle.thumbnail || "/placeholder.svg"}
            alt={`Vehículo ${vehicle.name}`}
            containerClassName="w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="h-16 w-16 text-gray-300 dark:text-gray-700" />
          </div>
        )}

        {/* Overlay con efecto de hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-white">{vehicle.name}</h4>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
              <Camera className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white">{vehicle.images}/4</span>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              onClick={() => onView(vehicle.id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ver
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 bg-green-500/50 backdrop-blur-sm border-green-400/30 text-white hover:bg-green-500/70"
              asChild
            >
              <Link href={`/captura?id=${vehicle.id}`}>
                <Camera className="h-3.5 w-3.5 mr-1" />
                Capturar
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="absolute top-2 right-2">
          <div
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1",
              getStatusColor(vehicle.status || "pending"),
            )}
          >
            {getStatusIcon(vehicle.status || "pending")}
            {getStatusText(vehicle.status || "pending")}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">{vehicle.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {vehicle.id}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(vehicle.images / 4) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(vehicle.date).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{vehicle.images}/4 fotos</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
