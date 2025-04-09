"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Camera,
  Menu,
  X,
  Bell,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  ImageIcon,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Palette,
  FileText,
  LayoutDashboard,
  Zap,
  Sparkles,
  Shield,
  Star,
  Bookmark,
  MessageSquare,
  UserPlus,
  Sliders,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

export default function PremiumHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [colorTheme, setColorTheme] = useState<"green" | "blue" | "purple" | "amber" | "rose" | "teal" | "cyan">(
    "green",
  )
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Scroll effects
  const { scrollY } = useScroll()
  const headerBgOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(0,0,0,0.1)"])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95])

  useEffect(() => {
    setIsMounted(true)

    // Cargar tema guardado
    const savedColorTheme = localStorage.getItem("header-color-theme") as
      | "green"
      | "blue"
      | "purple"
      | "amber"
      | "rose"
      | "teal"
      | "cyan"
      | null
    if (savedColorTheme) {
      setColorTheme(savedColorTheme)
    }

    // Verificar notificaciones no leídas
    const checkUnreadNotifications = () => {
      // Contar notificaciones no vistas basadas en cookies
      let unreadCount = 0

      // Verificar cada versión de la app
      const appVersions = ["v1.0.0", "v1.1.0", "v1.2.0"]
      for (const version of appVersions) {
        const hasSeenCookie = Cookies.get(`sao6_seen_${version}`)
        if (!hasSeenCookie) {
          unreadCount++
        }
      }

      setNotifications(unreadCount)
    }

    checkUnreadNotifications()

    // Verificar periódicamente por nuevas notificaciones
    const interval = setInterval(checkUnreadNotifications, 60000)

    // Manejar teclas de acceso rápido
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K para abrir búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const changeColorTheme = (newTheme: "green" | "blue" | "purple" | "amber" | "rose" | "teal" | "cyan") => {
    setColorTheme(newTheme)
    localStorage.setItem("header-color-theme", newTheme)
  }

  const getThemeColors = () => {
    switch (colorTheme) {
      case "blue":
        return {
          bgGradient: "from-blue-600 to-blue-500",
          lightGradient: "from-blue-400 to-blue-300",
          darkGradient: "from-blue-700 to-blue-600",
          textColor: "text-blue-500",
          hoverBg: "hover:bg-blue-50",
          hoverText: "hover:text-blue-800",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-500",
          darkBg: "dark:bg-blue-950",
          darkText: "dark:text-blue-300",
          darkHoverBg: "dark:hover:bg-blue-900",
          activeNavBg: "bg-blue-100 dark:bg-blue-900/30",
          activeNavText: "text-blue-700 dark:text-blue-300",
          ringColor: "ring-blue-500",
          shadowColor: "shadow-blue-500/20",
        }
      case "purple":
        return {
          bgGradient: "from-purple-600 to-purple-500",
          lightGradient: "from-purple-400 to-purple-300",
          darkGradient: "from-purple-700 to-purple-600",
          textColor: "text-purple-500",
          hoverBg: "hover:bg-purple-50",
          hoverText: "hover:text-purple-800",
          iconBg: "bg-purple-100",
          iconColor: "text-purple-500",
          darkBg: "dark:bg-purple-950",
          darkText: "dark:text-purple-300",
          darkHoverBg: "dark:hover:bg-purple-900",
          activeNavBg: "bg-purple-100 dark:bg-purple-900/30",
          activeNavText: "text-purple-700 dark:text-purple-300",
          ringColor: "ring-purple-500",
          shadowColor: "shadow-purple-500/20",
        }
      case "amber":
        return {
          bgGradient: "from-amber-600 to-amber-500",
          lightGradient: "from-amber-400 to-amber-300",
          darkGradient: "from-amber-700 to-amber-600",
          textColor: "text-amber-500",
          hoverBg: "hover:bg-amber-50",
          hoverText: "hover:text-amber-800",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-500",
          darkBg: "dark:bg-amber-950",
          darkText: "dark:text-amber-300",
          darkHoverBg: "dark:hover:bg-amber-900",
          activeNavBg: "bg-amber-100 dark:bg-amber-900/30",
          activeNavText: "text-amber-700 dark:text-amber-300",
          ringColor: "ring-amber-500",
          shadowColor: "shadow-amber-500/20",
        }
      case "rose":
        return {
          bgGradient: "from-rose-600 to-rose-500",
          lightGradient: "from-rose-400 to-rose-300",
          darkGradient: "from-rose-700 to-rose-600",
          textColor: "text-rose-500",
          hoverBg: "hover:bg-rose-50",
          hoverText: "hover:text-rose-800",
          iconBg: "bg-rose-100",
          iconColor: "text-rose-500",
          darkBg: "dark:bg-rose-950",
          darkText: "dark:text-rose-300",
          darkHoverBg: "dark:hover:bg-rose-900",
          activeNavBg: "bg-rose-100 dark:bg-rose-900/30",
          activeNavText: "text-rose-700 dark:text-rose-300",
          ringColor: "ring-rose-500",
          shadowColor: "shadow-rose-500/20",
        }
      case "teal":
        return {
          bgGradient: "from-teal-600 to-teal-500",
          lightGradient: "from-teal-400 to-teal-300",
          darkGradient: "from-teal-700 to-teal-600",
          textColor: "text-teal-500",
          hoverBg: "hover:bg-teal-50",
          hoverText: "hover:text-teal-800",
          iconBg: "bg-teal-100",
          iconColor: "text-teal-500",
          darkBg: "dark:bg-teal-950",
          darkText: "dark:text-teal-300",
          darkHoverBg: "dark:hover:bg-teal-900",
          activeNavBg: "bg-teal-100 dark:bg-teal-900/30",
          activeNavText: "text-teal-700 dark:text-teal-300",
          ringColor: "ring-teal-500",
          shadowColor: "shadow-teal-500/20",
        }
      case "cyan":
        return {
          bgGradient: "from-cyan-600 to-cyan-500",
          lightGradient: "from-cyan-400 to-cyan-300",
          darkGradient: "from-cyan-700 to-cyan-600",
          textColor: "text-cyan-500",
          hoverBg: "hover:bg-cyan-50",
          hoverText: "hover:text-cyan-800",
          iconBg: "bg-cyan-100",
          iconColor: "text-cyan-500",
          darkBg: "dark:bg-cyan-950",
          darkText: "dark:text-cyan-300",
          darkHoverBg: "dark:hover:bg-cyan-900",
          activeNavBg: "bg-cyan-100 dark:bg-cyan-900/30",
          activeNavText: "text-cyan-700 dark:text-cyan-300",
          ringColor: "ring-cyan-500",
          shadowColor: "shadow-cyan-500/20",
        }
      default:
        return {
          bgGradient: "from-green-600 to-green-500",
          lightGradient: "from-green-400 to-green-300",
          darkGradient: "from-green-700 to-green-600",
          textColor: "text-green-500",
          hoverBg: "hover:bg-green-50",
          hoverText: "hover:text-green-800",
          iconBg: "bg-green-100",
          iconColor: "text-green-500",
          darkBg: "dark:bg-green-950",
          darkText: "dark:text-green-300",
          darkHoverBg: "dark:hover:bg-green-900",
          activeNavBg: "bg-green-100 dark:bg-green-900/30",
          activeNavText: "text-green-700 dark:text-green-300",
          ringColor: "ring-green-500",
          shadowColor: "shadow-green-500/20",
        }
    }
  }

  const themeColors = getThemeColors()
  const title = "SAO6 - Flota Vehículos"

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  // Elementos de navegación
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Captura", href: "/captura", icon: <Camera className="h-4 w-4" /> },
    { name: "Galería", href: "/dashboard?view=gallery", icon: <ImageIcon className="h-4 w-4" /> },
  ]

  // Verificar si el enlace está activo
  const isLinkActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard" && !window.location.search.includes("view=gallery")) {
      return true
    }
    if (href === "/captura" && pathname === "/captura") {
      return true
    }
    if (
      href === "/dashboard?view=gallery" &&
      pathname === "/dashboard" &&
      window.location.search.includes("view=gallery")
    ) {
      return true
    }
    return false
  }

  return (
    <>
      <motion.header
        ref={headerRef}
        style={{
          boxShadow: isMounted ? headerShadow : "none",
          backgroundColor:
            theme === "dark" ? "rgba(3, 7, 18, 0.85)" : `rgba(255, 255, 255, ${isMounted ? headerBgOpacity.get() : 0})`,
        }}
        className={cn(
          "sticky top-0 z-50 w-full backdrop-blur-xl",
          theme === "dark" ? "border-b border-gray-800/50 text-white" : "border-b border-gray-100/50",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <motion.div
                  style={{ scale: logoScale }}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "bg-gradient-to-r p-2 rounded-xl shadow-lg relative overflow-hidden group",
                    themeColors.bgGradient,
                  )}
                >
                  <Camera className="h-6 w-6 text-white relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  />
                  {/* Efecto de brillo */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                  />
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-xl flex">
                    {title.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        initial="hidden"
                        animate="visible"
                        className={char === "-" ? "mx-1" : ""}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className={cn("text-xs", themeColors.textColor, themeColors.darkText)}
                  >
                    Sistema profesional de documentación
                  </motion.p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Search button/bar */}
              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="relative"
                  >
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                        theme === "dark" ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar vehículo... (Esc para cerrar)"
                      className={cn(
                        "w-full h-9 pl-10 pr-10 py-2 text-sm rounded-full border focus:outline-none focus:ring-2",
                        theme === "dark"
                          ? `bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:${themeColors.ringColor} focus:ring-offset-gray-900`
                          : `bg-gray-50 border-gray-200 focus:${themeColors.ringColor} focus:ring-offset-white`,
                      )}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setSearchOpen(false)
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <kbd
                        className={cn(
                          "hidden sm:inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium",
                          theme === "dark"
                            ? "border-gray-700 bg-gray-900 text-gray-400"
                            : "border-gray-200 bg-gray-100 text-gray-500",
                        )}
                      >
                        ESC
                      </kbd>
                      <button
                        className={cn(
                          "ml-1 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700",
                          theme === "dark" ? "text-gray-400" : "text-gray-500",
                        )}
                        onClick={() => setSearchOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-200 flex items-center gap-1",
                      theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                      <kbd
                        className={cn(
                          "inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium",
                          theme === "dark"
                            ? "border-gray-700 bg-gray-900 text-gray-400"
                            : "border-gray-200 bg-gray-100 text-gray-500",
                        )}
                      >
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-200 relative",
                      theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 bg-gradient-to-r ${themeColors.bgGradient} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg ${themeColors.shadowColor}`}
                      >
                        {notifications}
                      </motion.span>
                    )}
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 p-0 overflow-hidden"
                >
                  <div className={`p-4 bg-gradient-to-r ${themeColors.bgGradient} text-white`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notificaciones
                      </h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{notifications} nuevas</span>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications > 0 ? (
                      <div className="p-2 space-y-1">
                        <div
                          className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor}`}
                            >
                              <Star className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Nueva versión disponible</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Actualización v1.2.0 con mejoras de seguridad
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hace 2 horas</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-amber-500/20`}
                            >
                              <Bookmark className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Bienvenido al sistema</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Explora todas las funcionalidades disponibles
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hace 1 día</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                          <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No tienes notificaciones nuevas</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-2 rounded-full hidden md:flex transition-colors duration-200",
                      theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800"
                >
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${themeColors.textColor}`} />
                    <span>Personalización</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Color del Tema</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-1 p-2 w-56">
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("green")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/20" />
                          <span>Verde</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("blue")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20" />
                          <span>Azul</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("purple")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20" />
                          <span>Púrpura</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("amber")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 shadow-lg shadow-amber-500/20" />
                          <span>Ámbar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("rose")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg shadow-rose-500/20" />
                          <span>Rosa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("teal")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/20" />
                          <span>Teal</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("cyan")}
                          className="flex items-center gap-2 p-2 rounded-lg"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/20" />
                          <span>Cyan</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4 mr-2" />
                      ) : theme === "light" ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Laptop className="h-4 w-4 mr-2" />
                      )}
                      <span>Modo de Visualización</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800">
                        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-amber-100">
                            <Sun className="h-4 w-4 text-amber-500" />
                          </div>
                          <span>Claro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                            <Moon className="h-4 w-4 text-blue-500" />
                          </div>
                          <span>Oscuro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                            <Laptop className="h-4 w-4 text-gray-500" />
                          </div>
                          <span>Sistema</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>Ayuda y Soporte</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 p-1 rounded-full transition-colors duration-200",
                      theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium shadow-lg relative overflow-hidden",
                        `bg-gradient-to-r ${themeColors.bgGradient} ${themeColors.shadowColor}`,
                      )}
                    >
                      {user ? user.charAt(0).toUpperCase() : "U"}
                      {/* Efecto de brillo */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          ease: "linear",
                          repeatDelay: 3,
                        }}
                      />
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 p-0 overflow-hidden"
                >
                  <div className={`p-4 bg-gradient-to-r ${themeColors.bgGradient} text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{user || "Usuario"}</p>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                          <Shield className="h-3 w-3" />
                          <span>Administrador</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-1">
                      <DropdownMenuItem className="flex flex-col items-center justify-center p-3 rounded-lg">
                        <div
                          className={`p-2 rounded-full bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor} mb-1`}
                        >
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">Mi Perfil</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="flex flex-col items-center justify-center p-3 rounded-lg">
                        <div
                          className={`p-2 rounded-full bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor} mb-1`}
                        >
                          <Settings className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">Configuración</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="flex flex-col items-center justify-center p-3 rounded-lg">
                        <div
                          className={`p-2 rounded-full bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor} mb-1`}
                        >
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">Mensajes</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="flex flex-col items-center justify-center p-3 rounded-lg">
                        <div
                          className={`p-2 rounded-full bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor} mb-1`}
                        >
                          <UserPlus className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">Usuarios</span>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 m-2 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "p-2 rounded-full md:hidden transition-colors duration-200",
                  theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                )}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <motion.div
          style={{ opacity: isMounted ? navOpacity : 1 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "hidden md:block border-t",
            theme === "dark" ? "bg-gray-900/50 border-gray-800/50" : "bg-gray-50/50 border-gray-100/50",
          )}
        >
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = typeof window !== "undefined" && isLinkActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200 relative",
                      isActive
                        ? `${themeColors.activeNavBg} ${themeColors.activeNavText}`
                        : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                          : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        isActive
                          ? `bg-gradient-to-r ${themeColors.bgGradient} text-white shadow-md ${themeColors.shadowColor}`
                          : "bg-gray-200 dark:bg-gray-700",
                      )}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${themeColors.bgGradient}`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "absolute top-0 right-0 bottom-0 w-80 overflow-y-auto",
                theme === "dark" ? "bg-gray-900 border-l border-gray-800" : "bg-white border-l border-gray-100",
              )}
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-lg">Menú</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                {/* User info */}
                <div className={`p-4 rounded-xl bg-gradient-to-r ${themeColors.bgGradient} text-white mb-4`}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{user || "Usuario"}</p>
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <Shield className="h-3 w-3" />
                        <span>Administrador</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = typeof window !== "undefined" && isLinkActive(item.href)
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl",
                            isActive
                              ? `bg-gradient-to-r ${themeColors.bgGradient} text-white`
                              : theme === "dark"
                                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isActive ? "bg-white/20" : theme === "dark" ? "bg-gray-800" : themeColors.iconBg,
                            )}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            {isActive && <p className="text-xs text-white/80">Sección actual</p>}
                          </div>
                          {isActive && <Zap className="h-4 w-4" />}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personalización</h3>

                    <div>
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tema del Header</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => changeColorTheme("green")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "green" ? "rgb(34 197 94)" : "transparent",
                          }}
                          aria-label="Tema Verde"
                        />
                        <button
                          onClick={() => changeColorTheme("blue")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "blue" ? "rgb(59 130 246)" : "transparent",
                          }}
                          aria-label="Tema Azul"
                        />
                        <button
                          onClick={() => changeColorTheme("purple")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "purple" ? "rgb(168 85 247)" : "transparent",
                          }}
                          aria-label="Tema Púrpura"
                        />
                        <button
                          onClick={() => changeColorTheme("amber")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "amber" ? "rgb(245 158 11)" : "transparent",
                          }}
                          aria-label="Tema Ámbar"
                        />
                        <button
                          onClick={() => changeColorTheme("rose")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "rose" ? "rgb(244 63 94)" : "transparent",
                          }}
                          aria-label="Tema Rosa"
                        />
                        <button
                          onClick={() => changeColorTheme("teal")}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-transparent transition-all duration-200"
                          style={{
                            ringColor: colorTheme === "teal" ? "rgb(20 184 166)" : "transparent",
                          }}
                          aria-label="Tema Teal"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-2">Modo de Visualización</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTheme("light")}
                          className={cn(
                            "flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "light"
                              ? "bg-amber-100 text-amber-600 ring-2 ring-amber-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Claro"
                        >
                          <Sun className="h-4 w-4" />
                          <span className="text-xs">Claro</span>
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "dark"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Oscuro"
                        >
                          <Moon className="h-4 w-4" />
                          <span className="text-xs">Oscuro</span>
                        </button>
                        <button
                          onClick={() => setTheme("system")}
                          className={cn(
                            "flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "system"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Sistema"
                        >
                          <Laptop className="h-4 w-4" />
                          <span className="text-xs">Auto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"
                >
                  <Button
                    onClick={handleLogout}
                    className={`w-full bg-gradient-to-r ${themeColors.bgGradient} hover:opacity-90 text-white rounded-xl py-3 shadow-lg ${themeColors.shadowColor}`}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}