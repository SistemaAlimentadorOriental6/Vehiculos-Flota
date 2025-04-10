"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getFolders, getVehiclesInFolder, getVehicleImages } from "@/lib/api-service"

// Interfaces para los datos
export interface FolderData {
  id: string
  name: string
  count: number
}

// Modificar la interfaz VehicleData para actualizar los tipos de status
export interface VehicleData {
  id: string
  name: string
  folder: string
  date: string
  images: number
  status?: "completed" | "pending"
  thumbnail?: string
}

export interface ImageData {
  id: string
  vehicleId: string
  view: string
  url: string
  date: string
}

export interface ActivityItem {
  id: string
  vehicleId: string
  vehicleName?: string
  action: string
  timestamp: string
  timeAgo: string
  folder?: string
  imageCount?: number
}

// Modificar la interfaz DashboardData para eliminar inProgressVehicles
interface DashboardData {
  isLoading: boolean
  error: string | null
  totalFolders: number
  totalVehicles: number
  totalImages: number
  folders: FolderData[]
  recentVehicles: VehicleData[]
  allVehicles: VehicleData[] // Todos los vehículos
  completedVehicles: VehicleData[] // Vehículos completados
  pendingVehicles: VehicleData[] // Vehículos pendientes
  recentActivity: ActivityItem[]
  lastCapturedVehicle: {
    id: string
    name: string
    images: ImageData[]
  } | null
  refreshData: () => Promise<void>
}

const RealDataContext = createContext<DashboardData | undefined>(undefined)

export function useRealData() {
  const context = useContext(RealDataContext)
  if (context === undefined) {
    throw new Error("useRealData must be used within a RealDataProvider")
  }
  return context
}

// Función para formatear tiempo relativo
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return diffDays === 1 ? "hace 1 día" : `hace ${diffDays} días`
  }
  if (diffHours > 0) {
    return diffHours === 1 ? "hace 1 hora" : `hace ${diffHours} horas`
  }
  if (diffMins > 0) {
    return diffMins === 1 ? "hace 1 minuto" : `hace ${diffMins} minutos`
  }
  return "hace unos segundos"
}

// Modificar la función determineVehicleStatus para eliminar el estado "in-progress"
function determineVehicleStatus(imageCount: number): "completed" | "pending" {
  if (imageCount >= 4) return "completed"
  return "pending"
}

// Función para ordenar vehículos por ID numérico
function sortVehiclesByNumericId(vehicles: VehicleData[]): VehicleData[] {
  return [...vehicles].sort((a, b) => {
    // Extraer números de los IDs
    const numA = Number.parseInt(a.id.replace(/\D/g, "")) || 0
    const numB = Number.parseInt(b.id.replace(/\D/g, "")) || 0
    return numA - numB
  })
}

export function RealDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<FolderData[]>([])
  const [allVehicles, setAllVehicles] = useState<VehicleData[]>([])
  const [recentVehicles, setRecentVehicles] = useState<VehicleData[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [lastCapturedVehicle, setLastCapturedVehicle] = useState<{
    id: string
    name: string
    images: ImageData[]
  } | null>(null)

  // Función para cargar todos los datos
  const loadAllData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Cargar carpetas
      console.log("Cargando carpetas...")
      const foldersResult = await getFolders()

      if (!foldersResult.success || !foldersResult.folders) {
        throw new Error(foldersResult.message || "Error al cargar carpetas")
      }

      const loadedFolders = foldersResult.folders
      console.log(`Carpetas cargadas: ${loadedFolders.length}`)
      setFolders(loadedFolders)

      // 2. Cargar vehículos de cada carpeta
      const vehiclesArray: VehicleData[] = []
      const activityItems: ActivityItem[] = []

      for (const folder of loadedFolders) {
        console.log(`Cargando vehículos de la carpeta: ${folder.id}`)
        const vehiclesResult = await getVehiclesInFolder(folder.id)

        if (vehiclesResult.success && vehiclesResult.vehicles) {
          const folderVehicles = vehiclesResult.vehicles.map((vehicle) => {
            // Determinar el estado del vehículo basado en el número de imágenes
            const status = determineVehicleStatus(vehicle.images)

            return {
              ...vehicle,
              folder: folder.id,
              status,
            }
          })

          console.log(`Vehículos cargados para ${folder.id}: ${folderVehicles.length}`)
          vehiclesArray.push(...folderVehicles)

          // Crear elementos de actividad para cada vehículo
          folderVehicles.forEach((vehicle) => {
            activityItems.push({
              id: `${vehicle.id}-${Date.now()}`,
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              action: "guardado",
              timestamp: vehicle.date,
              timeAgo: getTimeAgo(vehicle.date),
              folder: folder.name,
              imageCount: vehicle.images,
            })
          })
        }
      }

      // Ordenar vehículos por ID numérico
      const sortedVehicles = sortVehiclesByNumericId(vehiclesArray)

      // Ordenar actividad por fecha (más recientes primero)
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      console.log(`Total de vehículos cargados: ${sortedVehicles.length}`)
      console.log(`Total de actividades: ${activityItems.length}`)

      // Guardar todos los vehículos
      setAllVehicles(sortedVehicles)

      // Para la vista principal, mostrar los 12 más recientes
      const recentOnes = [...sortedVehicles]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 12)

      setRecentVehicles(recentOnes)

      // Para actividades recientes, mantener solo las 10 más recientes para no sobrecargar la UI
      setRecentActivity(activityItems.slice(0, 10))

      // 3. Cargar imágenes del vehículo más reciente
      if (sortedVehicles.length > 0) {
        // Obtener el vehículo más reciente por fecha
        const mostRecentVehicle = [...sortedVehicles].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]

        console.log(`Cargando imágenes del vehículo más reciente: ${mostRecentVehicle.id}`)
        const imagesResult = await getVehicleImages(mostRecentVehicle.id)

        if (imagesResult.success && imagesResult.images) {
          console.log(`Imágenes cargadas: ${imagesResult.images.length}`)

          // Establecer la primera imagen como thumbnail para el vehículo
          if (imagesResult.images.length > 0) {
            const vehicleIndex = sortedVehicles.findIndex((v) => v.id === mostRecentVehicle.id)
            if (vehicleIndex >= 0) {
              sortedVehicles[vehicleIndex].thumbnail = imagesResult.images[0].url
              setAllVehicles([...sortedVehicles])
            }
          }

          setLastCapturedVehicle({
            id: mostRecentVehicle.id,
            name: mostRecentVehicle.name,
            images: imagesResult.images.map((img) => ({
              ...img,
              vehicleId: mostRecentVehicle.id,
            })),
          })
        }
      }
    } catch (err) {
      console.error("Error cargando datos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData()
  }, [])

  // Calcular totales y filtrar vehículos por estado
  const totalFolders = folders.length
  const totalVehicles = allVehicles.length
  const totalImages = allVehicles.reduce((sum, vehicle) => sum + vehicle.images, 0)

  // Modificar la parte donde se filtran los vehículos por estado
  // Filtrar vehículos por estado
  const completedVehicles = allVehicles.filter((v) => v.status === "completed")
  const pendingVehicles = allVehicles.filter((v) => v.status === "pending")

  // Actualizar el objeto value para eliminar inProgressVehicles
  const value = {
    isLoading,
    error,
    totalFolders,
    totalVehicles,
    totalImages,
    folders,
    recentVehicles,
    allVehicles,
    completedVehicles,
    pendingVehicles,
    recentActivity,
    lastCapturedVehicle,
    refreshData: loadAllData,
  }

  return <RealDataContext.Provider value={value}>{children}</RealDataContext.Provider>
}
