"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder,
  ChevronRight,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  Car,
  X,
  AlertCircle,
  RefreshCw,
  Truck,
  Wrench,
  Bike,
  Ambulance,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getFolders, getVehiclesInFolder, getVehicleImages } from "@/lib/api-service"
// Importar el componente ImageWithLoading
import ImageWithLoading from "@/components/image-with-loading"

// Interfaces para los datos
interface GalleryFolder {
  id: string
  name: string
  count: number
  icon: string
}

interface Vehicle {
  id: string
  name: string
  folder: string
  date: string
  images: number
}

interface Image {
  id: string
  vehicleId: string
  view: string
  url: string
  date: string
}

type ViewMode = "folders" | "vehicles" | "images"

export default function GalleryView() {
  const [viewMode, setViewMode] = useState<ViewMode>("folders")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Estados para los datos
  const [folders, setFolders] = useState<GalleryFolder[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Añadir manejo de carga de imágenes en GalleryView

  // Añadir un estado para rastrear las imágenes que están cargando
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  // Añadir funciones para manejar la carga de imágenes
  const handleImageLoadStart = (imageId: string) => {
    setLoadingImages((prev) => new Set(prev).add(imageId))
  }

  const handleImageLoadComplete = (imageId: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(imageId)
      return newSet
    })
  }

  // Cargar carpetas al inicio
  useEffect(() => {
    loadFolders()
  }, [])

  // Cargar vehículos cuando se selecciona una carpeta
  useEffect(() => {
    if (selectedFolder) {
      loadVehiclesInFolder(selectedFolder)
    }
  }, [selectedFolder])

  // Cargar imágenes cuando se selecciona un vehículo
  useEffect(() => {
    if (selectedVehicle) {
      loadVehicleImages(selectedVehicle)
    }
  }, [selectedVehicle])

  // Modificar la función loadFolders para manejar correctamente la respuesta del backend
  const loadFolders = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Intentar cargar desde la API
      const result = await getFolders()

      if (result.success && result.folders) {
        if (result.folders.length === 0) {
          setFolders([])
          setIsLoading(false)
          return
        }

        // Mapear los iconos según el nombre de la carpeta
        const foldersWithIcons = result.folders.map((folder) => {
          let icon = "folder"

          if (folder.name.toLowerCase().includes("camion")) icon = "truck"
          else if (folder.name.toLowerCase().includes("auto")) icon = "car"
          else if (folder.name.toLowerCase().includes("maquin")) icon = "tool"
          else if (folder.name.toLowerCase().includes("moto")) icon = "bike"
          else if (folder.name.toLowerCase().includes("especial")) icon = "ambulance"

          return { ...folder, icon }
        })

        setFolders(foldersWithIcons)
      } else {
        // Si no hay datos, establecer una lista vacía
        setFolders([])

        if (result.message) {
          console.warn("No se encontraron carpetas:", result.message)
        }
      }
    } catch (err) {
      console.error("Error al cargar carpetas:", err)
      setError("No se pudieron cargar las carpetas.")
      setFolders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Modificar la función loadVehiclesInFolder para manejar correctamente la respuesta del backend
  const loadVehiclesInFolder = async (folderId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getVehiclesInFolder(folderId)

      if (result.success && result.vehicles) {
        if (result.vehicles.length === 0) {
          setVehicles([])
          setIsLoading(false)
          return
        }

        // Mapear los vehículos para incluir la carpeta
        const vehiclesWithFolder = result.vehicles.map((vehicle) => ({
          ...vehicle,
          folder: folderId,
        }))

        setVehicles(vehiclesWithFolder)
      } else {
        // Si no hay datos, establecer una lista vacía
        setVehicles([])

        if (result.message) {
          console.warn("No se encontraron vehículos:", result.message)
        }
      }
    } catch (err) {
      console.error(`Error al cargar vehículos de la carpeta ${folderId}:`, err)
      setError("No se pudieron cargar los vehículos.")
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }

  // Modificar la función loadVehicleImages para manejar correctamente la respuesta del backend
  const loadVehicleImages = async (vehicleId: string) => {
    setIsLoading(true)
    setError(null)

    // Inicializar todas las imágenes como cargando
    setLoadingImages(new Set())

    try {
      const result = await getVehicleImages(vehicleId)

      if (result.success && result.images) {
        if (result.images.length === 0) {
          setImages([])
          setIsLoading(false)
          return
        }

        // Mapear las imágenes para incluir el ID del vehículo
        const imagesWithVehicleId = result.images.map((image) => {
          // Depurar la URL para diagnóstico
          console.log(`Imagen recibida: ${image.view}, URL: ${image.url}`)

          return {
            ...image,
            vehicleId,
          }
        })

        // Inicializar el estado de carga para cada imagen
        const initialLoadingState = new Set<string>()
        imagesWithVehicleId.forEach((img) => initialLoadingState.add(img.id))
        setLoadingImages(initialLoadingState)

        setImages(imagesWithVehicleId)
      } else {
        // Si no hay datos, establecer una lista vacía
        setImages([])

        if (result.message) {
          console.warn("No se encontraron imágenes:", result.message)
        }
      }
    } catch (err) {
      console.error(`Error al cargar imágenes del vehículo ${vehicleId}:`, err)
      setError("No se pudieron cargar las imágenes.")
      setImages([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId)
    setViewMode("vehicles")
  }

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    setViewMode("images")
  }

  const handleBackClick = () => {
    if (viewMode === "images") {
      setViewMode("vehicles")
      setSelectedVehicle(null)
    } else if (viewMode === "vehicles") {
      setViewMode("folders")
      setSelectedFolder(null)
    }
  }

  const getFolderName = () => {
    if (!selectedFolder) return ""
    const folder = folders.find((f) => f.id === selectedFolder)
    return folder ? folder.name : ""
  }

  const getVehicleName = () => {
    if (!selectedVehicle) return ""
    const vehicle = vehicles.find((v) => v.id === selectedVehicle)
    return vehicle ? vehicle.name : ""
  }

  // Función para renderizar el icono correcto según el tipo de carpeta
  const renderFolderIcon = (iconType: string) => {
    switch (iconType) {
      case "truck":
        return <Truck className="h-12 w-12 mb-2" />
      case "car":
        return <Car className="h-12 w-12 mb-2" />
      case "tool":
        return <Wrench className="h-12 w-12 mb-2" />
      case "bike":
        return <Bike className="h-12 w-12 mb-2" />
      case "ambulance":
        return <Ambulance className="h-12 w-12 mb-2" />
      default:
        return <Folder className="h-12 w-12 mb-2" />
    }
  }

  // Filtrar elementos según la búsqueda
  const filteredFolders = folders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredVehicles = vehicles.filter((vehicle) => vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredImages = images.filter((image) => image.view.toLowerCase().includes(searchQuery.toLowerCase()))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { y: -20, opacity: 0 },
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with breadcrumbs and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {viewMode !== "folders" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Volver</span>
            </Button>
          )}

          <div className="flex items-center text-gray-500">
            <span className="font-medium text-gray-800">Galería</span>
            {viewMode !== "folders" && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className={viewMode === "vehicles" ? "font-medium text-gray-800" : ""}>{getFolderName()}</span>
              </>
            )}
            {viewMode === "images" && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="font-medium text-gray-800">{getVehicleName()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-9 h-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-none rounded-l-md", displayMode === "grid" ? "bg-gray-100" : "")}
              onClick={() => setDisplayMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-none rounded-r-md", displayMode === "list" ? "bg-gray-100" : "")}
              onClick={() => setDisplayMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-green-500 animate-spin mb-2" />
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  if (viewMode === "folders") loadFolders()
                  else if (viewMode === "vehicles" && selectedFolder) loadVehiclesInFolder(selectedFolder)
                  else if (viewMode === "images" && selectedVehicle) loadVehicleImages(selectedVehicle)
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area with fixed height and scrolling */}
      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait">
          {viewMode === "folders" && !isLoading && (
            <motion.div
              key="folders"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "grid gap-4",
                displayMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1",
              )}
            >
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    variants={itemVariants}
                    onClick={() => handleFolderClick(folder.id)}
                    className={cn(
                      "bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                      displayMode === "list" ? "flex items-center" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
                        displayMode === "grid"
                          ? "p-6 flex flex-col items-center justify-center"
                          : "p-4 w-16 h-16 flex items-center justify-center",
                      )}
                    >
                      {displayMode === "grid" ? renderFolderIcon(folder.icon) : <Folder className="h-8 w-8" />}
                      {displayMode === "grid" && <span className="text-sm font-medium">{folder.count} vehículos</span>}
                    </div>

                    <div
                      className={cn("p-4", displayMode === "list" ? "flex-1 flex items-center justify-between" : "")}
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">{folder.name}</h3>
                        {displayMode === "list" && <p className="text-sm text-gray-500">{folder.count} vehículos</p>}
                      </div>

                      {displayMode === "list" && (
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Folder className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron carpetas</h3>
                  <p className="text-gray-500 max-w-md">
                    {searchQuery
                      ? `No hay carpetas que coincidan con "${searchQuery}"`
                      : "No hay carpetas disponibles en este momento"}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === "vehicles" && !isLoading && (
            <motion.div
              key="vehicles"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "grid gap-4",
                displayMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1",
              )}
            >
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    variants={itemVariants}
                    onClick={() => handleVehicleClick(vehicle.id)}
                    className={cn(
                      "bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                      displayMode === "list" ? "flex items-center" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-gradient-to-br from-green-500 to-green-600 text-white",
                        displayMode === "grid"
                          ? "p-6 flex flex-col items-center justify-center"
                          : "p-4 w-16 h-16 flex items-center justify-center",
                      )}
                    >
                      <Car className={displayMode === "grid" ? "h-12 w-12 mb-2" : "h-8 w-8"} />
                      {displayMode === "grid" && <span className="text-sm font-medium">{vehicle.images} fotos</span>}
                    </div>

                    <div
                      className={cn("p-4", displayMode === "list" ? "flex-1 flex items-center justify-between" : "")}
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">{vehicle.name}</h3>
                        <p className="text-sm text-gray-500">
                          {displayMode === "list" ? `${vehicle.images} fotos · ` : ""}
                          {new Date(vehicle.date).toLocaleDateString()}
                        </p>
                      </div>

                      {displayMode === "list" && (
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Car className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron vehículos</h3>
                  <p className="text-gray-500 max-w-md">
                    {searchQuery
                      ? `No hay vehículos que coincidan con "${searchQuery}"`
                      : "No hay vehículos disponibles en esta carpeta"}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === "images" && !isLoading && (
            <motion.div
              key="images"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col"
            >
              <div
                className={cn(
                  "grid gap-4",
                  displayMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4" : "grid-cols-1",
                )}
              >
                {filteredImages.length > 0 ? (
                  filteredImages.map((image) => (
                    <motion.div
                      key={image.id}
                      variants={itemVariants}
                      className={cn(
                        "bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
                        displayMode === "list" ? "flex items-center" : "",
                      )}
                    >
                      <div
                        className={cn("relative cursor-pointer", displayMode === "grid" ? "aspect-[4/3]" : "h-20 w-32")}
                        onClick={() => setSelectedImage(image.id)}
                      >
                        <ImageWithLoading
                          src={image.url || "/placeholder.svg"}
                          alt={`Vista ${image.view}`}
                          containerClassName="w-full h-full"
                          fallbackText="No se pudo cargar la imagen"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                            Ver
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn("p-3", displayMode === "list" ? "flex-1 flex items-center justify-between" : "")}
                      >
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm">{image.view}</h3>
                          <p className="text-xs text-gray-500">{new Date(image.date).toLocaleDateString()}</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Camera className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron imágenes</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchQuery
                        ? `No hay imágenes que coincidan con "${searchQuery}"`
                        : "No hay imágenes disponibles para este vehículo"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image viewer modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <ImageWithLoading
                  src={images.find((img) => img.id === selectedImage)?.url || ""}
                  alt="Vista ampliada"
                  objectFit="contain"
                  className="max-h-[70vh]"
                  containerClassName="w-full h-auto"
                  fallbackText="No se pudo cargar la imagen en tamaño completo"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 border-none text-white hover:bg-black/70 rounded-full"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 border-t">
                <h3 className="font-medium">
                  {images.find((img) => img.id === selectedImage)?.view} - {getVehicleName()}
                </h3>
                <p className="text-sm text-gray-500">
                  Capturada el{" "}
                  {new Date(images.find((img) => img.id === selectedImage)?.date || "").toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Compartir
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

