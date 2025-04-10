"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import {
  Search,Download,
  Share2,
  ArrowLeft,
  Calendar,
  ImageIcon,
  Grid,
  Layers3,
  Car,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Info,
  Maximize,
  Minimize,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getFolders, getVehiclesInFolder, getVehicleImages } from "@/lib/api-service"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import ImageThumbnailStrip from "./components/image-thumbnail-strip"
import DownloadIndicator from "./components/download-indicator"
import ImagePreloader from "./components/image-preloader"
import MultiSelectToolbar from "./components/multi-select-toolbar"
import ShareModal from "./components/share-modal"
import DownloadOptionsModal from "./components/download-options-modal"
import MobileImageControls from "./components/mobile-image-controls"
import TouchImageViewer from "./components/touch-image-viewer"
import { useMobile } from "@/hooks/use-mobile"

// Interfaces para los datos
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

export default function GalleryView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("todos")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showImageInfo, setShowImageInfo] = useState(false)
  const imageViewerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [imageLoading, setImageLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFlippedHorizontally, setIsFlippedHorizontally] = useState(false)
  const [isFlippedVertically, setIsFlippedVertically] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState("")
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [vehicleImages, setVehicleImages] = useState<{ [key: string]: Image[] }>({})
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  // Pan and zoom state
  const [isPanning, setIsPanning] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const startX = useRef(0)
  const startY = useRef(0)

  // Toast notifications
  const { toast } = useToast()

  // Mobile detection
  const isMobile = useMobile()

  // Cargar vehículos al inicio
  useEffect(() => {
    loadAllVehicles()

    // Cargar búsquedas recientes
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Cargar imágenes cuando se selecciona un vehículo
  useEffect(() => {
    if (selectedVehicle) {
      loadVehicleImages(selectedVehicle)
    }
  }, [selectedVehicle])

  // Precargar imágenes para las previsualizaciones de vehículos
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      // Precargar imágenes para los primeros 4 vehículos
      const preloadVehicles = vehicles.slice(0, 4)

      preloadVehicles.forEach((vehicle) => {
        if (!vehicleImages[vehicle.id]) {
          getVehicleImages(vehicle.id)
            .then((result) => {
              if (result.success && result.images) {
                setVehicleImages((prev) => ({
                  ...prev,
                  [vehicle.id]: result.images,
                }))
              }
            })
            .catch((err) => {
              console.error(`Error precargando imágenes para ${vehicle.id}:`, err)
            })
        }
      })
    }
  }, [vehicles, selectedVehicle, vehicleImages])

  // Guardar búsquedas recientes
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
  }, [recentSearches])

  // Effect to reset image loading state when image changes
  useEffect(() => {
    if (selectedImage) {
      setImageLoading(true)
    }
  }, [selectedImage, currentImageIndex])

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    if (images.length > 0 && selectedImage) {
      const currentIndex = images.findIndex((img) => img.id === selectedImage)
      if (currentIndex !== -1) {
        setCurrentImageIndex(currentIndex)
      }
    }
  }, [images, selectedImage])

  // Reset pan position when image changes
  useEffect(() => {
    x.set(0)
    y.set(0)
    setZoomLevel(1)
    setRotation(0)
    setIsFlippedHorizontally(false)
    setIsFlippedVertically(false)
  }, [currentImageIndex, x, y])

  // Enhanced keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === "ArrowRight") {
          showNextImage()
          e.preventDefault()
        } else if (e.key === "ArrowLeft") {
          showPrevImage()
          e.preventDefault()
        } else if (e.key === "Escape") {
          closeImageViewer()
          e.preventDefault()
        } else if (e.key === "+" || e.key === "=") {
          setZoomLevel((prev) => Math.min(prev + 0.25, 3))
          e.preventDefault()
        } else if (e.key === "-" || e.key === "_") {
          setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
          e.preventDefault()
        } else if (e.key.toLowerCase() === "r") {
          setRotation((prev) => (prev + 90) % 360)
          e.preventDefault()
        } else if (e.key.toLowerCase() === "i") {
          setShowImageInfo((prev) => !prev)
          e.preventDefault()
        } else if (e.key.toLowerCase() === "f") {
          toggleFullscreen()
          e.preventDefault()
        } else if (e.key.toLowerCase() === "d") {
          handleDownloadOptions()
          e.preventDefault()
        } else if (e.key.toLowerCase() === "s") {
          handleShareOptions()
          e.preventDefault()
        } else if (e.key.toLowerCase() === "h") {
          setShowKeyboardHelp((prev) => !prev)
          e.preventDefault()
        } else if (e.key.toLowerCase() === "x") {
          setIsFlippedHorizontally((prev) => !prev)
          e.preventDefault()
        } else if (e.key.toLowerCase() === "y") {
          setIsFlippedVertically((prev) => !prev)
          e.preventDefault()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, images, currentImageIndex, selectedVehicle])

  // Add fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const loadAllVehicles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Obtener todas las carpetas primero
      const foldersResult = await getFolders()

      if (!foldersResult.success || !foldersResult.folders) {
        throw new Error("No se pudieron cargar las carpetas")
      }

      // Cargar vehículos de todas las carpetas
      const allVehiclesPromises = foldersResult.folders.map((folder) => getVehiclesInFolder(folder.id))
      const results = await Promise.all(allVehiclesPromises)

      // Combinar todos los vehículos
      const allVehicles: Vehicle[] = []

      results.forEach((result, index) => {
        if (result.success && result.vehicles) {
          const vehiclesWithFolder = result.vehicles.map((vehicle) => ({
            ...vehicle,
            folder: foldersResult.folders[index].id,
          }))
          allVehicles.push(...vehiclesWithFolder)
        }
      })

      setVehicles(allVehicles)
    } catch (err) {
      console.error("Error al cargar vehículos:", err)
      setError("No se pudieron cargar los vehículos.")
      setVehicles([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadVehicleImages = async (vehicleId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we already have the images cached
      if (vehicleImages[vehicleId]) {
        setImages(
          vehicleImages[vehicleId].map((image) => ({
            ...image,
            vehicleId,
          })),
        )
        setIsLoading(false)
        return
      }

      const result = await getVehicleImages(vehicleId)

      if (result.success && result.images) {
        const imagesWithVehicleId = result.images.map((image) => ({
          ...image,
          vehicleId,
        }))
        setImages(imagesWithVehicleId)

        // Cache the images
        setVehicleImages((prev) => ({
          ...prev,
          [vehicleId]: result.images,
        }))
      } else {
        setImages([])
      }
    } catch (err) {
      console.error(`Error al cargar imágenes del vehículo ${vehicleId}:`, err)
      setError("No se pudieron cargar las imágenes.")
      setImages([])
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to generate search suggestions
  const generateSearchSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    const suggestions = vehicles
      .map((v) => v.name)
      .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)

    setSearchSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
  }

  // Modify the handleImageClick function to handle multi-select
  const handleImageClick = (imageId: string, e?: React.MouseEvent) => {
    if (isMultiSelectMode) {
      toggleImageSelection(imageId)
      return
    }

    const index = images.findIndex((img) => img.id === imageId)
    if (index !== -1) {
      setCurrentImageIndex(index)
      setSelectedImage(imageId)
    }
  }

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    // Reset multi-select when changing vehicles
    setIsMultiSelectMode(false)
    setSelectedImageIds([])
  }

  const showNextImage = () => {
    if (images.length > 1) {
      const newIndex = (currentImageIndex + 1) % images.length
      setCurrentImageIndex(newIndex)
      setSelectedImage(images[newIndex].id)
    }
  }

  const showPrevImage = () => {
    if (images.length > 1) {
      const newIndex = (currentImageIndex - 1 + images.length) % images.length
      setCurrentImageIndex(newIndex)
      setSelectedImage(images[newIndex].id)
    }
  }

  const closeImageViewer = () => {
    setSelectedImage(null)
    setZoomLevel(1)
    setRotation(0)
    setShowImageInfo(false)
    x.set(0)
    y.set(0)
  }

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode)
    if (isMultiSelectMode) {
      setSelectedImageIds([])
    }
  }

  // Toggle image selection in multi-select mode
  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  // Handle download options
  const handleDownloadOptions = () => {
    if (isMultiSelectMode) {
      if (selectedImageIds.length > 0) {
        setShowDownloadModal(true)
      } else {
        toast({
          title: "Selecciona imágenes",
          description: "Selecciona al menos una imagen para descargar",
          duration: 3000,
        })
      }
    } else if (selectedImage) {
      // Single image download from viewer
      const image = images[currentImageIndex]
      if (image) {
        handleDownloadImage(image.url, `${getVehicleName(selectedVehicle || "")}_${image.view}`)
      }
    } else {
      // Open multi-select mode for downloads
      setIsMultiSelectMode(true)
      toast({
        title: "Modo selección activado",
        description: "Selecciona las imágenes que deseas descargar",
        duration: 3000,
      })
    }
  }

  // Handle share options
  const handleShareOptions = () => {
    if (isMultiSelectMode) {
      if (selectedImageIds.length > 0) {
        setShowShareModal(true)
      } else {
        toast({
          title: "Selecciona imágenes",
          description: "Selecciona al menos una imagen para compartir",
          duration: 3000,
        })
      }
    } else if (selectedImage) {
      // Share single image from viewer
      const image = images[currentImageIndex]
      if (image) {
        setSelectedImageIds([image.id])
        setShowShareModal(true)
      }
    } else {
      // Open multi-select mode for sharing
      setIsMultiSelectMode(true)
      toast({
        title: "Modo selección activado",
        description: "Selecciona las imágenes que deseas compartir",
        duration: 3000,
      })
    }
  }

  // Enhanced download function with visual feedback
  const handleDownloadImage = (imageUrl: string, imageName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    // Show download indicator
    setIsDownloading(true)
    setDownloadingFile(`${imageName}.jpg`)

    // Create a fetch request to get the image
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob)

        // Create a temporary link and trigger download
        const link = document.createElement("a")
        link.href = url
        link.download = `${imageName}.jpg`
        document.body.appendChild(link)
        link.click()

        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)

        // Keep the indicator visible for a visual feedback
        setTimeout(() => {
          setIsDownloading(false)
          setDownloadingFile("")

          toast({
            title: "Descarga completada",
            description: `${imageName}.jpg se ha descargado correctamente`,
            duration: 3000,
          })
        }, 2000)
      })
      .catch((error) => {
        console.error("Error downloading image:", error)
        setIsDownloading(false)
        setDownloadingFile("")

        toast({
          title: "Error de descarga",
          description: "No se pudo descargar la imagen. Inténtalo de nuevo.",
          variant: "destructive",
          duration: 3000,
        })
      })
  }

  const handleShareImage = async (imageUrl: string, imageName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    try {
      // Intentar compartir directamente con la API Web Share
      if (navigator.share && navigator.canShare) {
        // Descargar la imagen como blob
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error("No se pudo descargar la imagen")

        const blob = await response.blob()
        const file = new File([blob], `${imageName}.jpg`, { type: blob.type })

        const shareData = {
          title: `Imagen de ${getVehicleName(selectedVehicle || "")}`,
          text: `Compartiendo imagen: ${imageName}`,
          files: [file],
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      // Si no se puede compartir directamente, usar el modal
      setSelectedImageIds([images.find((img) => img.url === imageUrl)?.id || ""])
      setShowShareModal(true)
    } catch (error) {
      console.error("Error al compartir imagen:", error)
      // Fallback al modal de compartir
      setSelectedImageIds([images.find((img) => img.url === imageUrl)?.id || ""])
      setShowShareModal(true)
    }
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? vehicle.name : ""
  }

  const zoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setRotation((prev) => (prev + 90) % 360)
  }

  const rotateCounterClockwise = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setRotation((prev) => (prev - 90 + 360) % 360)
  }

  const flipHorizontal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsFlippedHorizontally((prev) => !prev)
  }

  const flipVertical = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsFlippedVertically((prev) => !prev)
  }

  const toggleImageInfo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowImageInfo((prev) => !prev)
  }

  // Toggle fullscreen mode
  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Pan image handlers
  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true)
      startX.current = e.clientX - x.get()
      startY.current = e.clientY - y.get()
      e.preventDefault()
    }
  }

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      const newX = e.clientX - startX.current
      const newY = e.clientY - startY.current

      // Calculate boundaries based on zoom level
      const maxX = (zoomLevel - 1) * 200
      const maxY = (zoomLevel - 1) * 200

      // Constrain movement within boundaries
      const constrainedX = Math.max(-maxX, Math.min(maxX, newX))
      const constrainedY = Math.max(-maxY, Math.min(maxY, newY))

      x.set(constrainedX)
      y.set(constrainedY)
      e.preventDefault()
    }
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  // Handle double tap for mobile zoom
  const handleDoubleTap = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1)
      x.set(0)
      y.set(0)
    } else {
      setZoomLevel(2)
    }
  }

  // Aplicar filtros a los vehículos
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filtro de búsqueda
    if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filtro de pestaña activa
    if (activeTab === "recientes") {
      const vehicleDate = new Date(vehicle.date)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      if (vehicleDate < oneMonthAgo) {
        return false
      }
    }

    return true
  })

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  // Function to render the collage preview for a vehicle
  const renderVehicleCollage = (vehicle: Vehicle) => {
    const vehiclePreviewImages = vehicleImages[vehicle.id] || []
    const hasImages = vehiclePreviewImages.length > 0

    return (
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
          {/* Collage grid */}
          {hasImages ? (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 opacity-40">
              {vehiclePreviewImages.slice(0, 4).map((image, index) => (
                <div key={index} className="relative overflow-hidden">
                  <img src={image.url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {/* Fill empty slots with placeholders */}
              {Array.from({ length: Math.max(0, 4 - vehiclePreviewImages.length) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="bg-black/20" />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=600')] bg-center bg-cover opacity-10 mix-blend-overlay" />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Vehicle number badge */}
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">#{vehicle.name}</h3>
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-none">
              {vehicle.images} imágenes
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  const handleSearch = () => {
    if (searchQuery) {
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)])
      }
    }
  }

  // Check if we have a valid current image
  const currentImage =
    images.length > 0 && currentImageIndex >= 0 && currentImageIndex < images.length ? images[currentImageIndex] : null

  // Get selected images for modals
  const getSelectedImages = () => {
    return images.filter((img) => selectedImageIds.includes(img.id))
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header con búsqueda y filtros */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 sm:px-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedVehicle ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                onClick={() => setSelectedVehicle(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Volver</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 rounded-md text-white">
                  <Car className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Galería de Vehículos</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 md:w-80">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Buscar vehículos..."
                className="pl-9 pr-4 py-2 w-full border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  generateSearchSuggestions(e.target.value)
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    generateSearchSuggestions(searchQuery)
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                    setShowSuggestions(false)
                  }
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchQuery("")
                    setSearchSuggestions([])
                    setShowSuggestions(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 hover:text-green-700 text-sm transition-colors"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        handleSearch()
                      }}
                    >
                      <span className="flex items-center">
                        <Search className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        {suggestion}
                      </span>
                    </button>
                  ))}
                  {recentSearches.length > 0 && searchSuggestions.length < 3 && (
                    <>
                      <div className="px-4 py-1 text-xs text-gray-500 border-t border-gray-100 mt-1">
                        Búsquedas recientes
                      </div>
                      {recentSearches.slice(0, 3).map((recent, index) => (
                        <button
                          key={`recent-${index}`}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-600 hover:text-green-700 text-sm transition-colors"
                          onClick={() => {
                            setSearchQuery(recent)
                            setShowSuggestions(false)
                            handleSearch()
                          }}
                        >
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                            {recent}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex border rounded-full border-gray-200 p-0.5 bg-gray-50">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full",
                  viewMode === "grid" ? "bg-white text-green-600 shadow-sm" : "text-gray-500",
                )}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full",
                  viewMode === "list" ? "bg-white text-green-600 shadow-sm" : "text-gray-500",
                )}
                onClick={() => setViewMode("list")}
              >
                <Layers3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas para filtrar vehículos */}
      {!selectedVehicle && (
        <div className="px-4 sm:px-6 pt-3">
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-xl">
              <TabsTrigger
                value="todos"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
              >
                Todos los vehículos
              </TabsTrigger>
              <TabsTrigger
                value="recientes"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
              >
                Recientes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6">
            {isLoading && !selectedVehicle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={loadAllVehicles}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {!isLoading && !error && !selectedVehicle && (
              <>
                {filteredVehicles.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "grid gap-4 sm:gap-6",
                      viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1",
                    )}
                  >
                    {filteredVehicles.map((vehicle) => (
                      <motion.div
                        key={vehicle.id}
                        variants={itemVariants}
                        className={cn(
                          "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200",
                          viewMode === "list" && "flex items-center",
                        )}
                        onClick={() => handleVehicleClick(vehicle.id)}
                      >
                        {viewMode === "grid" ? (
                          renderVehicleCollage(vehicle)
                        ) : (
                          <div className="h-24 w-24 flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden">
                            <div className="text-white text-center">
                              <span className="text-xl font-bold block">#{vehicle.name}</span>
                            </div>
                          </div>
                        )}

                        <div className={cn("p-4", viewMode === "list" && "flex-1")}>
                          <h3 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                            Vehículo #{vehicle.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(vehicle.date).toLocaleDateString()}</span>
                            {viewMode === "list" && (
                              <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-200 border-none">
                                {vehicle.images} imágenes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-green-50 rounded-full p-5 mb-4">
                      <ImageIcon className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron vehículos</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchQuery
                        ? `No hay vehículos que coincidan con "${searchQuery}"`
                        : "No hay vehículos disponibles en este momento"}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => setSearchQuery("")}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {selectedVehicle && !isLoading && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 sm:p-2 rounded-lg text-white">
                      <Car className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                      Vehículo #{getVehicleName(selectedVehicle)}
                    </h2>
                  </div>

                  {/* Multi-select mode toggle */}
                  {images.length > 0 && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant={isMultiSelectMode ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3",
                          isMultiSelectMode ? "bg-green-600 hover:bg-green-700" : "text-gray-600 hover:text-green-600",
                        )}
                        onClick={toggleMultiSelectMode}
                      >
                        {isMultiSelectMode ? (
                          <>
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Modo selección</span>
                            <span className="sm:hidden">Selección</span>
                          </>
                        ) : (
                          <>
                            <span>Seleccionar</span>
                          </>
                        )}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9 text-gray-600 hover:text-green-600"
                              onClick={handleDownloadOptions}
                            >
                              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Descargar imágenes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9 text-gray-600 hover:text-green-600"
                              onClick={handleShareOptions}
                            >
                              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Compartir imágenes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                {images.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                  >
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        variants={itemVariants}
                        className={cn(
                          "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-200",
                          isMultiSelectMode && selectedImageIds.includes(image.id) && "ring-2 ring-green-500",
                        )}
                      >
                        <div
                          className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                          onClick={() => handleImageClick(image.id)}
                        >
                          {/* Selection overlay for multi-select mode */}
                          {isMultiSelectMode && (
                            <div className="absolute top-2 right-2 z-30">
                              <div
                                className={cn(
                                  "h-6 w-6 rounded-full flex items-center justify-center border-2",
                                  selectedImageIds.includes(image.id)
                                    ? "bg-green-500 border-white"
                                    : "bg-white/70 border-gray-300",
                                )}
                              >
                                {selectedImageIds.includes(image.id) && <Check className="h-3 w-3 text-white" />}
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Vista ${image.view}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10 relative"
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.opacity = "1"
                              const parent = target.parentElement
                              if (parent) {
                                const loader = parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("opacity-0")
                              }
                            }}
                            style={{ opacity: 0, transition: "opacity 0.3s ease" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30">
                            <p className="font-medium">{image.view}</p>
                          </div>

                          {!isMultiSelectMode && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700 hover:text-green-600 rounded-full shadow-sm"
                                      onClick={(e) =>
                                        handleDownloadImage(
                                          image.url,
                                          `${getVehicleName(selectedVehicle)}_${image.view}`,
                                          e,
                                        )
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Descargar</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700 hover:text-green-600 rounded-full shadow-sm"
                                      onClick={(e) =>
                                        handleShareImage(
                                          image.url,
                                          `${getVehicleName(selectedVehicle)}_${image.view}`,
                                          e,
                                        )
                                      }
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Compartir</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                            {image.view}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(image.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-green-50 rounded-full p-5 mb-4">
                      <ImageIcon className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No se encontraron imágenes</h3>
                    <p className="text-gray-500 max-w-md">Este vehículo no tiene imágenes disponibles</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Visor de imágenes a pantalla completa */}
      {selectedImage && (
        <AnimatePresence>
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" onClick={closeImageViewer}>
            {/* Background gradient for aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/95 pointer-events-none" />

            {/* Header controls - only for desktop */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-800/60 backdrop-blur-md bg-black/60 z-20"
              >
                <div className="text-white">
                  <h3 className="font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <Badge className="bg-green-600 text-white border-green-500 hover:bg-green-700">
                      #{getVehicleName(selectedVehicle || "")}
                    </Badge>
                    <span className="text-gray-200 truncate max-w-[100px] sm:max-w-full">
                      {currentImage?.view || ""}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400 ml-1 sm:ml-2">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={zoomIn}
                        >
                          <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Acercar (+)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={zoomOut}
                        >
                          <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Alejar (-)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={rotate}
                        >
                          <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Rotar (R)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={rotateCounterClockwise}
                        >
                          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Rotar al revés</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={flipHorizontal}
                        >
                          <FlipHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Voltear horizontal (X)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={flipVertical}
                        >
                          <FlipVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Voltear vertical (Y)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="hidden sm:block">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                            onClick={toggleImageInfo}
                          >
                            <Info className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Mostrar/Ocultar Info (I)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={handleDownloadOptions}
                        >
                          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Descargar (D)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="hidden sm:block">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                            onClick={handleShareOptions}
                          >
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Compartir (S)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Pantalla completa (F)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all ml-1"
                          onClick={closeImageViewer}
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Cerrar (Esc)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>
            )}

            {/* Mobile header - simplified */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-3 border-b border-gray-800/60 backdrop-blur-md bg-black/60 z-20"
              >
                <div className="text-white">
                  <h3 className="font-medium flex items-center gap-1 text-sm">
                    <Badge className="bg-green-600 text-white border-green-500 hover:bg-green-700">
                      #{getVehicleName(selectedVehicle || "")}
                    </Badge>
                    <span className="text-gray-200 truncate max-w-[100px]">{currentImage?.view || ""}</span>
                  </h3>
                </div>

                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-300 hover:text-white rounded-full"
                    onClick={closeImageViewer}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Image navigation and viewer controls */}
            <div className="flex-1 relative" ref={imageViewerRef}>
              {/* Mobile-friendly navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/50 text-white z-10 hover:bg-black/70 group"
                    onClick={(e) => {
                      e.stopPropagation()
                      showPrevImage()
                    }}
                  >
                    <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:-translate-x-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/50 text-white z-10 hover:bg-black/70 group"
                    onClick={(e) => {
                      e.stopPropagation()
                      showNextImage()
                    }}
                  >
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
                  </Button>
                </>
              )}

              <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4 overflow-hidden">
                {currentImage ? (
                  isMobile ? (
                    <TouchImageViewer
                      src={currentImage.url || ""}
                      alt={currentImage.view || "Image view"}
                      zoomLevel={zoomLevel}
                      rotation={rotation}
                      isFlippedHorizontally={isFlippedHorizontally}
                      isFlippedVertically={isFlippedVertically}
                      onDoubleTap={handleDoubleTap}
                      onImageLoad={() => setImageLoading(false)}
                    />
                  ) : (
                    <motion.div
                      key={currentImage.id}
                      className="relative"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: "transform 0.3s ease",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={handlePanStart}
                      onMouseMove={handlePanMove}
                      onMouseUp={handlePanEnd}
                      onMouseLeave={handlePanEnd}
                    >
                      {/* Show loading placeholder while the full image loads */}
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                          <div className="relative w-12 h-12 md:w-16 md:h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500/20 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-green-500 rounded-full animate-spin"></div>
                          </div>
                        </div>
                      )}

                      {currentImage.url ? (
                        <motion.img
                          ref={imageRef}
                          src={currentImage.url || "/placeholder.svg"}
                          alt={currentImage.view || "Image view"}
                          className={cn(
                            "max-h-[80vh] max-w-full object-contain transition-opacity duration-500 shadow-2xl",
                            imageLoading ? "opacity-0" : "opacity-100",
                            isFlippedHorizontally ? "scale-x-[-1]" : "",
                            isFlippedVertically ? "scale-y-[-1]" : "",
                            zoomLevel > 1 ? "cursor-grab" : "",
                            isPanning ? "cursor-grabbing" : "",
                          )}
                          style={{
                            x,
                            y,
                          }}
                          onLoad={() => setImageLoading(false)}
                          draggable="false"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
                          <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-gray-300">No se pudo cargar la imagen</p>
                        </div>
                      )}

                      {/* Information overlay */}
                      {showImageInfo && currentImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 md:p-4 backdrop-blur-lg">
                          <h4 className="font-medium text-base md:text-lg">{currentImage.view}</h4>
                          <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 text-xs md:text-sm">
                            <div>
                              <p className="text-gray-300 mb-1">Fecha</p>
                              <p className="text-white">{new Date(currentImage.date || "").toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-300 mb-1">Vehículo</p>
                              <p className="text-white">#{getVehicleName(selectedVehicle || "")}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
                    <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-300">No hay imagen seleccionada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile controls */}
            {isMobile && (
              <MobileImageControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onRotate={rotate}
                onDownload={handleDownloadOptions}
                onShare={handleShareOptions}
                onInfo={toggleImageInfo}
                onClose={closeImageViewer}
                showInfo={showImageInfo}
              />
            )}

            {/* Thumbnails navigation */}
            {images.length > 0 && (
              <ImageThumbnailStrip
                images={images}
                currentIndex={currentImageIndex}
                onSelect={(index, e) => {
                  if (e) e.stopPropagation()
                  setCurrentImageIndex(index)
                  setSelectedImage(images[index].id)
                }}
              />
            )}
          </div>
        </AnimatePresence>
      )}

      {/* Hot key instructions overlay */}
      {showKeyboardHelp && (
        <div
          className="fixed inset-0 bg-black/90 z-50 p-4 sm:p-8 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation()
            setShowKeyboardHelp(false)
          }}
        >
          <div
            className="bg-gray-900/80 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-gray-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-white mb-4">Atajos de Teclado</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 sm:gap-x-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Siguiente imagen</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">→</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Imagen anterior</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">←</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Acercar</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">+</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Alejar</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">-</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Rotar</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">R</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Voltear horizontal</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">X</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Voltear vertical</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">Y</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Información</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">I</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Descargar</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">D</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Compartir</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Pantalla completa</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Salir</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs">Esc</kbd>
              </div>
            </div>
            <button
              className="mt-6 py-2 px-4 bg-green-600 text-white rounded-lg w-full hover:bg-green-700 transition-colors"
              onClick={() => setShowKeyboardHelp(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Multi-select toolbar */}
      <MultiSelectToolbar
        selectedCount={selectedImageIds.length}
        onDownload={() => setShowDownloadModal(true)}
        onShare={() => setShowShareModal(true)}
        onCancel={() => {
          setIsMultiSelectMode(false)
          setSelectedImageIds([])
        }}
      />

      {/* Share modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        images={getSelectedImages()}
        vehicleName={getVehicleName(selectedVehicle || "")}
      />

      {/* Download options modal */}
      <DownloadOptionsModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        images={getSelectedImages()}
        vehicleName={getVehicleName(selectedVehicle || "")}
      />

      {/* Image preloader for smoother navigation */}
      {selectedImage && (
        <ImagePreloader
          urls={images.map((img) => img.url).filter(Boolean)}
          onProgress={(percent) => {
            // Optional: You can use this to show loading progress
          }}
          onComplete={() => {
            // Optional: You can use this when all images are loaded
          }}
        />
      )}

      {/* Download indicator */}
      <DownloadIndicator
        fileName={downloadingFile || ""}
        show={isDownloading}
        onComplete={() => {
          setIsDownloading(false)
          setDownloadingFile("")
        }}
      />
    </div>
  )
}
