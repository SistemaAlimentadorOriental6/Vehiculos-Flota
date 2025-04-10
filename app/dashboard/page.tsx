"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Camera,
  Car,
  RefreshCw,
  ChevronRight,
  Calendar,
  Clock,
  Zap,
  ImageIcon,
  PlusCircle,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Share2,
  ArrowRight,
  Sparkles,
  Folder,
} from "lucide-react"
import PremiumHeader from "@/components/premium-header"
import { RealDataProvider, useRealData } from "@/components/dashboard/real-data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import VersionNotification from "@/components/version-notification"
import Link from "next/link"
import EnhancedGalleryView from "../../components/enhanced-photo-gallery"
import ImageWithLoading from "@/components/image-with-loading"
import VehicleStatusDashboard from "../../components/dashboard/vehicle-status-dashboard"

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
    recentVehicles,
    completedVehicles,
    pendingVehicles,
    allVehicles,
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

  // Datos para el progreso de vehículos
  const totalVehiclesCount = 260 // Total de vehículos en el sistema
  const capturedVehiclesCount = allVehicles.length // Total de vehículos documentados
  const pendingVehiclesCount = 260 - capturedVehiclesCount // Vehículos pendientes
  const progressPercentage = Math.round((capturedVehiclesCount / totalVehiclesCount) * 100)

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

  // Función para generar un color basado en el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-amber-500"
      case "pending":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  // Función para generar un texto basado en el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En progreso"
      case "pending":
        return "Pendiente"
      default:
        return "Desconocido"
    }
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

        {/* Sección del banner */}
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
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
                  Sistema profesional de documentación de flota vehicular.
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

          {/* Estadísticas del sistema - Versión mejorada con scroll horizontal en móvil */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 overflow-hidden">
            <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-4 snap-x snap-mandatory">
              {/* Carpetas */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[200px] flex-shrink-0 snap-start">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Folder className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white/70 text-sm">Carpetas</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{totalFolders || 0}</span>
                      <span className="text-white/70 text-xs">detectadas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehículos */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[200px] flex-shrink-0 snap-start">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white/70 text-sm">Vehículos</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{capturedVehiclesCount}</span>
                      <span className="text-white/70 text-xs">de {totalVehiclesCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[200px] flex-shrink-0 snap-start">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white/70 text-sm">Imágenes</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{totalImages || 0}</span>
                      <span className="text-white/70 text-xs">capturadas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[200px] flex-shrink-0 snap-start">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white/70 text-sm">Progreso</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                      <span className="text-white/70 text-xs">completado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pendientes */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm min-w-[200px] flex-shrink-0 snap-start">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white/70 text-sm">Pendientes</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{pendingVehiclesCount}</span>
                      <span className="text-white/70 text-xs">vehículos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative pt-4 mt-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-white/20">
                    PROGRESO DE DOCUMENTACIÓN
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-white">
                    {capturedVehiclesCount} de {totalVehiclesCount} vehículos
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-2 text-xs flex rounded-full bg-white/20">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-300 to-green-500 relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      ease: "linear",
                      repeatDelay: 0.5,
                    }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>Completados: {completedVehicles.length}</span>
                <span>Pendientes: {pendingVehiclesCount}</span>
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
        {/* Columna izquierda - Último vehículo capturado (rediseñado) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
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
                  {/* Nuevo diseño para el último vehículo capturado */}
                  <div className="relative">
                    {/* Fondo con gradiente y efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-500 overflow-hidden">
                      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-xl"></div>
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {/* Efecto de brillo animado */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          ease: "linear",
                          repeatDelay: 1,
                        }}
                      />
                    </div>

                    {/* Contenido del header */}
                    <div className="relative z-10 p-6 text-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                              <Car className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Último Vehículo Capturado</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                              ID: {lastCapturedVehicle.id}
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                              {lastCapturedVehicle.name}
                            </div>
                          </div>
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
                    </div>
                  </div>

                  {/* Galería de imágenes mejorada */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {lastCapturedVehicle.images.length > 0 ? (
                        lastCapturedVehicle.images.map((image, index) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 group shadow-md hover:shadow-xl transition-all"
                            whileHover={{ y: -5, scale: 1.02 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <ImageWithLoading
                              src={image.url || "/placeholder.svg"}
                              alt={`Vista ${image.view}`}
                              containerClassName="w-full h-full"
                              objectFit="cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
                              {image.view}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{image.view}</p>
                                <div className="flex gap-1">
                                  <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                  <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                    <Share2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
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

          {/* Nueva sección: Lista de vehículos documentados mejorada */}
          <VehicleStatusDashboard />
        </motion.div>

        {/* Columna derecha - Actividad reciente (rediseñada) */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Actividad reciente mejorada */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-0">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Actividad Reciente</h3>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium">
                    Últimas 24h
                  </div>
                </div>
              </div>

              {/* Contenido de actividad */}
              <div className="p-6">
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
                  <div className="space-y-6">
                    {recentActivity.slice(0, 5).map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="relative"
                      >
                        {/* Línea de tiempo */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 z-0"></div>

                        {/* Contenido de la actividad */}
                        <div className="relative z-10 pl-12">
                          {/* Círculo indicador */}
                          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <Camera className="h-4 w-4 text-white" />
                          </div>

                          {/* Tarjeta de actividad */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
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
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-2 py-1 rounded-full">
                                  {item.timeAgo}
                                </span>
                              </div>
                            </div>

                            {/* Botón de acción */}
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg"
                                asChild
                              >
                                <Link href={`/captura?id=${item.vehicleId}`}>
                                  <span>Ver detalles</span>
                                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Resumen de progreso */}
          <Card className="overflow-hidden border-0 shadow-lg dark:shadow-gray-900/10 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Resumen de Progreso</h3>
              </div>

              <div className="space-y-6">
                {/* Tarjeta de progreso animada */}
                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-5 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {/* Efecto de brillo */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-purple-800 dark:text-purple-300">Progreso Total</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          {capturedVehiclesCount} de {totalVehiclesCount} vehículos
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-3 rounded-xl shadow-md">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-purple-700 dark:text-purple-300">Progreso</span>
                        <span className="font-bold text-purple-800 dark:text-purple-200">{progressPercentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Estadísticas de vehículos */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-md mb-3">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h5 className="text-2xl font-bold text-green-700 dark:text-green-400">{capturedVehiclesCount}</h5>
                      <p className="text-xs text-green-600 dark:text-green-500">Completados</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-xl shadow-md mb-3">
                        <XCircle className="h-6 w-6" />
                      </div>
                      <h5 className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingVehiclesCount}</h5>
                      <p className="text-xs text-amber-600 dark:text-amber-500">Pendientes</p>
                    </div>
                  </motion.div>
                </div>

                {/* Botón de actualización */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={refreshData}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-4 shadow-lg hover:shadow-xl transition-all"
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
            <EnhancedGalleryView />
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
