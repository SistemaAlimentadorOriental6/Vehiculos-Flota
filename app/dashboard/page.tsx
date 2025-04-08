"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Camera,
  FileCheck,
  Car,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Layers,
  ImageIcon,
  PlusCircle,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react"
import PremiumHeader from "@/components/premium-header"
import GalleryView from "@/components/gallery/gallery-view"
import { RealDataProvider, useRealData } from "@/components/dashboard/real-data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import VersionNotification from "@/components/version-notification"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Efectos de parallax para elementos decorativos
  const circleOneY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const circleTwoY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const circleThreeY = useTransform(scrollYProgress, [0, 1], [0, -150])

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Manejar el scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Formatear fecha actual
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentTime)

  // Formatear hora actual
  const formattedTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(currentTime)

  // Calcular porcentaje de uso del sistema
  const systemUsagePercent = Math.min(
    100,
    Math.max(5, totalVehicles > 0 ? (totalImages / (totalVehicles * 4)) * 100 : 5),
  )

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto space-y-8 pb-12">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-green-500/5 dark:bg-green-500/10 blur-3xl"
          style={{ y: circleOneY }}
        />
        <motion.div
          className="absolute top-[40%] left-[5%] w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"
          style={{ y: circleTwoY }}
        />
        <motion.div
          className="absolute bottom-40 right-[15%] w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl"
          style={{ y: circleThreeY }}
        />
      </div>

      {/* Banner de bienvenida mejorado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-green-500 shadow-lg"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white/20"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 rounded-full bg-white/15"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 rounded-full bg-white/10"></div>

          {/* Patrón de puntos decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-sm font-medium flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {formattedTime}
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-sm font-medium flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {formattedDate}
                </div>
              </div>

              <div>
                <motion.h1
                  className="text-3xl sm:text-4xl font-bold text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {greeting} <span className="text-white/90">{user || "Usuario"}</span>
                </motion.h1>
                <motion.p
                  className="text-white/80 text-lg mt-2 max-w-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Bienvenido al Sistema de Control de Flota Vehicular. Gestiona y documenta tu flota de manera
                  eficiente.
                </motion.p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all rounded-xl py-6 px-6"
                  asChild
                >
                  <Link href="/captura">
                    <Camera className="mr-2 h-5 w-5" />
                    <span className="font-medium">Nueva Captura</span>
                    <div className="ml-2 bg-green-100 rounded-full p-1">
                      <ChevronRight className="h-4 w-4 text-green-600" />
                    </div>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  className="w-full sm:w-auto bg-green-700/40 hover:bg-green-700/50 text-white shadow-lg hover:shadow-xl transition-all rounded-xl py-6 px-6 backdrop-blur-sm"
                  asChild
                >
                  <Link href="/dashboard?view=gallery">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    <span className="font-medium">Ver Galería</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Indicadores de sistema */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Carpetas</p>
                <p className="text-white font-bold text-xl">{isLoading ? "-" : totalFolders}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Vehículos</p>
                <p className="text-white font-bold text-xl">{isLoading ? "-" : totalVehicles}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Imágenes</p>
                <p className="text-white font-bold text-xl">{isLoading ? "-" : totalImages}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal en dos columnas */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Columna izquierda */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Último vehículo capturado */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Último Vehículo Capturado</h3>
                  </div>
                  <div className="flex justify-center items-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-green-100 dark:border-green-900/30 border-t-green-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-green-500 text-xs font-medium">
                        Cargando
                      </div>
                    </div>
                  </div>
                </div>
              ) : lastCapturedVehicle ? (
                <div>
                  <div className="bg-gradient-to-r from-green-600/90 to-green-500/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Último Vehículo Capturado</h3>
                      <p className="text-green-100 flex items-center gap-2 mt-1">
                        <Car className="h-4 w-4" />
                        {lastCapturedVehicle.name}
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          ID: {lastCapturedVehicle.id}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl"
                      asChild
                    >
                      <Link href={`/captura?id=${lastCapturedVehicle.id}`}>
                        <Camera className="h-4 w-4 mr-2" />
                        Ver Vehículo
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {lastCapturedVehicle.images.length > 0 ? (
                        lastCapturedVehicle.images.map((image, index) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={`Vista ${image.view}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-sm font-medium">{image.view}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-4 flex flex-col items-center justify-center py-12 text-center">
                          <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                            No hay imágenes disponibles
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            Este vehículo aún no tiene imágenes capturadas
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Último Vehículo Capturado</h3>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Car className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                      No hay vehículos capturados
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      Aún no se han capturado vehículos en el sistema
                    </p>
                    <Button
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl"
                      asChild
                    >
                      <Link href="/captura">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Capturar Vehículo
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas del sistema */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Estadísticas del Sistema</h3>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  Tiempo real
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Carpetas</p>
                      <h4 className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">
                        {isLoading ? "-" : totalFolders}
                      </h4>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-md">
                      <Layers className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">Carpetas disponibles en el sistema</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Vehículos</p>
                      <h4 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                        {isLoading ? "-" : totalVehicles}
                      </h4>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl shadow-md">
                      <Car className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Vehículos registrados en el sistema</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Imágenes</p>
                      <h4 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mt-1">
                        {isLoading ? "-" : totalImages}
                      </h4>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-3 rounded-xl shadow-md">
                      <Camera className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Imágenes capturadas en el sistema</p>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Uso del sistema</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(systemUsagePercent)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      systemUsagePercent < 30
                        ? "bg-green-500"
                        : systemUsagePercent < 70
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: `${systemUsagePercent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Basado en la relación entre imágenes capturadas y vehículos registrados
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Columna derecha */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Actividad reciente */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Actividad Reciente</h3>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
                  Últimas 24h
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-500 text-xs font-medium">
                      Cargando
                    </div>
                  </div>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-5">
                  {recentActivity.slice(0, 5).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700"
                    >
                      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-4 border-green-500 -translate-x-2.5"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            Vehículo {item.vehicleId} {item.action}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {item.vehicleName && `${item.vehicleName} - `}
                            {item.folder && `Carpeta: ${item.folder}`}
                            {item.imageCount && ` - ${item.imageCount} imágenes`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {item.timeAgo}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {recentActivity.length > 5 && (
                    <div className="pt-2 text-center">
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 gap-1">
                        Ver todas las actividades
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No hay actividad reciente
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    No se ha registrado actividad reciente en el sistema
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón de actualización */}
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={refreshData}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl py-6 shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  <span className="font-medium">Actualizando datos...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  <span className="font-medium">Actualizar Datos</span>
                </>
              )}
            </Button>
          </motion.div>

          {/* Resumen del sistema */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Resumen del Sistema</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Eficiencia del Sistema</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rendimiento óptimo</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      98%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                    <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Documentación</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vehículos documentados</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      {isLoading ? "-" : totalVehicles}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                    <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Capturas</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Imágenes almacenadas</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      {isLoading ? "-" : totalImages}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Mensaje de error si existe */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-300 shadow-lg"
          >
            <div className="flex items-start">
              <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Error al cargar datos</h3>
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={refreshData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view")

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 dark:text-white flex flex-col">
        <PremiumHeader />
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
