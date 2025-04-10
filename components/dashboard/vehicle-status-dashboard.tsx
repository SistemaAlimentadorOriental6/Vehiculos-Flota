"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Car,
  Camera,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Download,
  Share2,
  RefreshCw,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useRealData } from "./real-data-provider"
import ImageWithLoading from "@/components/image-with-loading"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Importar el nuevo componente VehicleCard
import VehicleCard from "./vehicle-card"

export default function VehicleStatusDashboard() {
  const router = useRouter()
  const { isLoading, error, allVehicles, completedVehicles, pendingVehicles, refreshData } = useRealData()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "id-asc" | "id-desc">("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [isScrollable, setIsScrollable] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const itemsPerPage = 8

  // Determinar qué vehículos mostrar según la pestaña activa
  const getVehiclesByTab = () => {
    switch (activeTab) {
      case "completed":
        return completedVehicles
      case "pending":
        return pendingVehicles
      default:
        return allVehicles
    }
  }

  // Filtrar vehículos según la búsqueda
  const filteredVehicles = getVehiclesByTab().filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Ordenar vehículos según el criterio seleccionado
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "id-asc": {
        const numA = Number.parseInt(a.id.replace(/\D/g, "")) || 0
        const numB = Number.parseInt(b.id.replace(/\D/g, "")) || 0
        return numA - numB
      }
      case "id-desc": {
        const numA = Number.parseInt(a.id.replace(/\D/g, "")) || 0
        const numB = Number.parseInt(b.id.replace(/\D/g, "")) || 0
        return numB - numA
      }
      default:
        return 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage)
  const paginatedVehicles = sortedVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Comprobar si el contenedor es scrollable horizontalmente
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current
        setIsScrollable(scrollWidth > clientWidth)
      }
    }

    checkScrollable()
    window.addEventListener("resize", checkScrollable)

    return () => {
      window.removeEventListener("resize", checkScrollable)
    }
  }, [paginatedVehicles])

  // Función para desplazarse horizontalmente
  const scrollHorizontally = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft

      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth",
      })
    }
  }

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

  // Función para cambiar de página
  const changePage = (page: number) => {
    setCurrentPage(page)
    // Scroll al inicio de la lista
    window.scrollTo({ top: document.getElementById("vehicle-list")?.offsetTop || 0, behavior: "smooth" })
  }

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pageNumbers = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center justify-center mt-6 gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => changePage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 rounded-full"
              onClick={() => changePage(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 rounded-full"
            onClick={() => changePage(number)}
          >
            {number}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 rounded-full"
              onClick={() => changePage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex flex-col space-y-6">
        {/* Encabezado con estadísticas */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
                Vehículos Documentados
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Gestiona y visualiza el estado de documentación de la flota
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-full">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Vehículos</p>
                    <p className="text-xl font-bold text-white">
                      {allVehicles.length} <span className="text-sm font-normal">de 260</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Completados</p>
                    <p className="text-xl font-bold text-white">{completedVehicles.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Pendientes</p>
                    <p className="text-xl font-bold text-white">{260 - allVehicles.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-white">PROGRESO DE DOCUMENTACIÓN</p>
                <p className="text-sm font-medium text-white">{allVehicles.length} de 260 vehículos</p>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(allVehicles.length / 260) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-white/80">
                <span>Completados: {completedVehicles.length}</span>
                <span>Pendientes: {260 - allVehicles.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar vehículo..."
              className="pl-9 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Resetear a la primera página al buscar
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                setCurrentPage(1) // Resetear a la primera página al cambiar de tab
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completados
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pendientes
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>Más recientes primero</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Más antiguos primero</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("id-asc")}>Por ID (ascendente)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("id-desc")}>Por ID (descendente)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => refreshData()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => router.push("/dashboard?view=gallery")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de vehículos */}
        <div id="vehicle-list" className="relative">
          {isScrollable && (
            <>
              <button
                onClick={() => scrollHorizontally("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollHorizontally("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div ref={scrollContainerRef} className="overflow-x-auto pb-4 -mx-6 px-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-green-100 dark:border-green-900/30 border-t-green-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-green-500 text-xs font-medium">
                    Cargando
                  </div>
                </div>
              </div>
            ) : paginatedVehicles.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[640px]"
              >
                {paginatedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onView={() => setSelectedVehicle(vehicle.id)} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Car className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No se encontraron vehículos
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  {searchQuery
                    ? `No hay vehículos que coincidan con "${searchQuery}"`
                    : "No hay vehículos disponibles en este momento"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paginación */}
        {renderPagination()}

        {/* Mensaje de error si existe */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error al cargar datos</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle del vehículo */}
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Detalles del Vehículo</h3>

                {allVehicles.find((v) => v.id === selectedVehicle) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        {allVehicles.find((v) => v.id === selectedVehicle)?.thumbnail ? (
                          <ImageWithLoading
                            src={allVehicles.find((v) => v.id === selectedVehicle)?.thumbnail || ""}
                            alt={`Vehículo ${allVehicles.find((v) => v.id === selectedVehicle)?.name}`}
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <Car className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <div className="flex justify-between items-center">
                            <div className="text-white text-sm font-medium">
                              {allVehicles.find((v) => v.id === selectedVehicle)?.name}
                            </div>
                            <div className="flex gap-1">
                              <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <Download className="h-3.5 w-3.5 text-white" />
                              </button>
                              <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <Share2 className="h-3.5 w-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID del Vehículo</h4>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{selectedVehicle}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Registro</h4>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {new Date(
                              allVehicles.find((v) => v.id === selectedVehicle)?.date || "",
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Carpeta</h4>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {allVehicles.find((v) => v.id === selectedVehicle)?.folder || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h4>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {allVehicles.find((v) => v.id === selectedVehicle)?.name || "N/A"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h4>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mt-1",
                            getStatusColor(allVehicles.find((v) => v.id === selectedVehicle)?.status || "pending"),
                          )}
                        >
                          {getStatusIcon(allVehicles.find((v) => v.id === selectedVehicle)?.status || "pending")}
                          {getStatusText(allVehicles.find((v) => v.id === selectedVehicle)?.status || "pending")}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Imágenes Capturadas</h4>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {allVehicles.find((v) => v.id === selectedVehicle)?.images || 0} de 4 fotos
                          </p>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${(allVehicles.find((v) => v.id === selectedVehicle)?.images || 0) * 25}%`,
                              }}
                            ></div>
                          </div>
                        </div>
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
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
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
