"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getFolders, getVehiclesInFolder, getVehicleImages } from "@/lib/api-service"

// Interfaces para los datos
export interface FolderData {
  id: string
  name: string
  count: number
}

export interface VehicleData {
  id: string
  name: string
  folder: string
  date: string
  images: number
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

interface DashboardData {
  isLoading: boolean
  error: string | null
  totalFolders: number
  totalVehicles: number
  totalImages: number
  folders: FolderData[]
  recentVehicles: VehicleData[]
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

export function RealDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<FolderData[]>([])
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
      const foldersResult = await getFolders()

      if (!foldersResult.success || !foldersResult.folders) {
        throw new Error(foldersResult.message || "Error al cargar carpetas")
      }

      const loadedFolders = foldersResult.folders
      setFolders(loadedFolders)

      // 2. Cargar vehículos de cada carpeta
      const allVehicles: VehicleData[] = []
      const activityItems: ActivityItem[] = []

      for (const folder of loadedFolders) {
        const vehiclesResult = await getVehiclesInFolder(folder.id)

        if (vehiclesResult.success && vehiclesResult.vehicles) {
          const folderVehicles = vehiclesResult.vehicles.map((vehicle) => ({
            ...vehicle,
            folder: folder.id,
          }))

          allVehicles.push(...folderVehicles)

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

      // Ordenar vehículos por fecha (más recientes primero)
      allVehicles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Ordenar actividad por fecha (más recientes primero)
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setRecentVehicles(allVehicles.slice(0, 6)) // Tomar los 6 más recientes
      setRecentActivity(activityItems.slice(0, 10)) // Tomar los 10 más recientes

      // 3. Cargar imágenes del vehículo más reciente
      if (allVehicles.length > 0) {
        const mostRecentVehicle = allVehicles[0]
        const imagesResult = await getVehicleImages(mostRecentVehicle.id)

        if (imagesResult.success && imagesResult.images) {
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

  // Calcular totales
  const totalFolders = folders.length
  const totalVehicles = recentVehicles.length
  const totalImages = recentVehicles.reduce((sum, vehicle) => sum + vehicle.images, 0)

  const value = {
    isLoading,
    error,
    totalFolders,
    totalVehicles,
    totalImages,
    folders,
    recentVehicles,
    recentActivity,
    lastCapturedVehicle,
    refreshData: loadAllData,
  }

  return <RealDataContext.Provider value={value}>{children}</RealDataContext.Provider>
}

