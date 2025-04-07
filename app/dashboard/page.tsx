"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Camera, FileCheck, Car, RefreshCw } from "lucide-react"
import EnhancedHeaderV2 from "@/components/enhanced-header-v2"
import GalleryView from "@/components/gallery/gallery-view"
import WelcomeBanner from "@/components/dashboard/welcome-banner"
import AnimatedStatsCard from "@/components/dashboard/animated-stats-card"
import RealActivityTimeline from "@/components/dashboard/real-activity-timeline"
import LastCapturedVehicle from "@/components/dashboard/last-captured-vehicle"
import { RealDataProvider, useRealData } from "@/components/dashboard/real-data-provider"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import VersionNotification from "@/components/version-notification"

// Componente principal del dashboard que usa los datos reales
function DashboardContent() {
  const {
    isLoading,
    error,
    totalFolders,
    totalVehicles,
    totalImages,
    recentActivity,
    lastCapturedVehicle,
    refreshData,
  } = useRealData()

  const { user } = useAuth()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    // Determinar el saludo según la hora del día
    const hour = new Date().getHours()
    let greetingText = ""

    if (hour >= 5 && hour < 12) {
      greetingText = "¡Buenos días!"
    } else if (hour >= 12 && hour < 18) {
      greetingText = "¡Buenas tardes!"
    } else {
      greetingText = "¡Buenas noches!"
    }

    setGreeting(greetingText)
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner de bienvenida */}
      <WelcomeBanner userName={user || "Usuario"} greeting={greeting} />

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnimatedStatsCard
          title="Total de Carpetas"
          value={isLoading ? 0 : totalFolders}
          icon={<FileCheck className="h-5 w-5" />}
          color="green"
          description="Carpetas disponibles en el sistema"
        />
        <AnimatedStatsCard
          title="Total de Vehículos"
          value={isLoading ? 0 : totalVehicles}
          icon={<Car className="h-5 w-5" />}
          color="blue"
          delay={0.1}
          description="Vehículos registrados"
        />
        <AnimatedStatsCard
          title="Total de Capturas"
          value={isLoading ? 0 : totalImages}
          icon={<Camera className="h-5 w-5" />}
          color="purple"
          delay={0.2}
          description="Imágenes capturadas"
        />
      </div>

      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Último vehículo capturado */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Último Vehículo Capturado</h3>
              </div>
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            </div>
          ) : lastCapturedVehicle ? (
            <LastCapturedVehicle
              vehicleId={lastCapturedVehicle.id}
              vehicleName={lastCapturedVehicle.name}
              images={lastCapturedVehicle.images}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Último Vehículo Capturado</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No hay vehículos capturados
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Aún no se han capturado vehículos en el sistema
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Línea de tiempo de actividad */}
          <RealActivityTimeline items={recentActivity} isLoading={isLoading} />

          {/* Botón de actualización */}
          <Button
            onClick={refreshData}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Datos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          <h3 className="font-bold mb-2">Error al cargar datos</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view")

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 dark:text-white flex flex-col">
        <EnhancedHeaderV2 />
        <VersionNotification />
        <main className="flex-1 container mx-auto px-4 py-6">
          {/* Si estamos en la vista de galería, mostrar el componente de galería */}
          {view === "gallery" ? (
            <GalleryView />
          ) : (
            <RealDataProvider>
              <DashboardContent />
            </RealDataProvider>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

