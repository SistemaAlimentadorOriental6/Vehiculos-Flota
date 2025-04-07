"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car, Camera, Search, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import ImageWithLoading from "@/components/image-with-loading"

interface Vehicle {
  id: string
  name: string
  date: string
  status: "completed" | "pending" | "in-progress"
  images: number
  thumbnail?: string
}

interface RecentVehiclesGridProps {
  vehicles: Vehicle[]
}

export default function RecentVehiclesGrid({ vehicles }: RecentVehiclesGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  // Filtrar vehículos según la búsqueda
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-amber-100 text-amber-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Función para obtener el texto según el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "pending":
        return "Pendiente"
      case "in-progress":
        return "En Progreso"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Vehículos Recientes</h3>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar vehículo..."
              className="pl-9 h-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredVehicles.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              variants={itemVariants}
              className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              whileHover={{ y: -3 }}
            >
              <div className="aspect-[4/3] relative bg-gray-100">
                {vehicle.thumbnail ? (
                  <ImageWithLoading
                    src={vehicle.thumbnail || "/placeholder.svg"}
                    alt={`Vehículo ${vehicle.name}`}
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-16 w-16 text-gray-300" />
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <div className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(vehicle.status))}>
                    {getStatusText(vehicle.status)}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{vehicle.name}</h4>
                    <p className="text-sm text-gray-500">ID: {vehicle.id}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                    <Camera className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium">{vehicle.images}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">{vehicle.date}</span>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-gray-600 hover:text-gray-900"
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      asChild
                    >
                      <Link href={`/captura?id=${vehicle.id}`}>
                        <Camera className="h-3.5 w-3.5 mr-1" />
                        Capturar
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron vehículos</h3>
          <p className="text-gray-500 max-w-md">
            {searchQuery
              ? `No hay vehículos que coincidan con "${searchQuery}"`
              : "No hay vehículos disponibles en este momento"}
          </p>
        </div>
      )}

      {/* Vista previa del vehículo */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVehicle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detalles del Vehículo</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-300" />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">ID del Vehículo</h4>
                        <p className="font-medium">{selectedVehicle}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Fecha de Registro</h4>
                        <p className="font-medium">{vehicles.find((v) => v.id === selectedVehicle)?.date || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                      <p className="font-medium">{vehicles.find((v) => v.id === selectedVehicle)?.name || "N/A"}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                      <div
                        className={cn(
                          "inline-block px-2 py-1 rounded-md text-xs font-medium mt-1",
                          getStatusColor(vehicles.find((v) => v.id === selectedVehicle)?.status || ""),
                        )}
                      >
                        {getStatusText(vehicles.find((v) => v.id === selectedVehicle)?.status || "")}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Imágenes Capturadas</h4>
                      <p className="font-medium">{vehicles.find((v) => v.id === selectedVehicle)?.images || 0} fotos</p>
                    </div>

                    <div className="pt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl"
                        asChild
                      >
                        <Link href={`/captura?id=${selectedVehicle}`}>
                          <Camera className="h-4 w-4 mr-2" />
                          Continuar Captura
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedVehicle(null)}>
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

