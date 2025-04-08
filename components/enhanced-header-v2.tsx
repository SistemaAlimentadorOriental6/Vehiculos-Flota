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

export default function EnhancedHeaderV2() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [colorTheme, setColorTheme] = useState<"green" | "blue" | "purple" | "amber" | "rose">("green")
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)

  // Scroll effects
  const { scrollY } = useScroll()
  const headerBgOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(0,0,0,0.1)"])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])

  useEffect(() => {
    setIsMounted(true)

    // Cargar tema guardado
    const savedColorTheme = localStorage.getItem("header-color-theme") as
      | "green"
      | "blue"
      | "purple"
      | "amber"
      | "rose"
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

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const changeColorTheme = (newTheme: "green" | "blue" | "purple" | "amber" | "rose") => {
    setColorTheme(newTheme)
    localStorage.setItem("header-color-theme", newTheme)
  }

  const getThemeColors = () => {
    switch (colorTheme) {
      case "blue":
        return {
          bgGradient: "from-blue-600 to-blue-500",
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
        }
      case "purple":
        return {
          bgGradient: "from-purple-600 to-purple-500",
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
        }
      case "amber":
        return {
          bgGradient: "from-amber-600 to-amber-500",
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
        }
      case "rose":
        return {
          bgGradient: "from-rose-600 to-rose-500",
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
        }
      default:
        return {
          bgGradient: "from-green-600 to-green-500",
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
    { name: "Reportes", href: "#", icon: <FileText className="h-4 w-4" /> },
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
            theme === "dark" ? "rgb(3, 7, 18)" : `rgba(255, 255, 255, ${isMounted ? headerBgOpacity.get() : 0})`,
        }}
        className={cn(
          "sticky top-0 z-50 w-full backdrop-blur-md",
          theme === "dark" ? "border-gray-800 text-white" : "border-gray-100",
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
                    "bg-gradient-to-r p-2 rounded-xl shadow-md relative overflow-hidden group",
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
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      placeholder="Buscar vehículo..."
                      className={cn(
                        "w-full h-9 px-3 py-2 text-sm rounded-full border focus:ring-2 focus:ring-offset-2",
                        theme === "dark"
                          ? `bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-${colorTheme}-500 focus:ring-offset-gray-900`
                          : `bg-white border-gray-200 focus:ring-${colorTheme}-500 focus:ring-offset-white`,
                      )}
                      autoFocus
                    />
                    <button
                      className={cn(
                        "absolute right-2 top-1/2 transform -translate-y-1/2",
                        theme === "dark" ? "text-gray-400" : "text-gray-500",
                      )}
                      onClick={() => setSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-200",
                      theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-2 rounded-full transition-colors duration-200",
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-1 -right-1 bg-gradient-to-r ${themeColors.bgGradient} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg`}
                    >
                      {notifications}
                    </motion.span>
                  )}
                </motion.button>
              </div>

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
                      <DropdownMenuSubContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800">
                        <DropdownMenuItem onClick={() => changeColorTheme("green")} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-600 to-green-500" />
                          <span>Verde (Default)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeColorTheme("blue")} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500" />
                          <span>Azul</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeColorTheme("purple")}
                          className="flex items-center gap-2"
                        >
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-500" />
                          <span>Púrpura</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeColorTheme("amber")} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500" />
                          <span>Ámbar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeColorTheme("rose")} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-rose-600 to-rose-500" />
                          <span>Rosa</span>
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
                          <Sun className="h-4 w-4 mr-2 text-amber-500" />
                          <span>Claro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                          <Moon className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Oscuro</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 mr-2 text-gray-500" />
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
                        "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium shadow-md",
                        `bg-gradient-to-r ${themeColors.bgGradient}`,
                      )}
                    >
                      {user ? user.charAt(0).toUpperCase() : "U"}
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800"
                >
                  <div className="p-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${themeColors.bgGradient} text-white`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{user || "Usuario"}</p>
                          <p className="text-xs text-white/80">Administrador</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4 mr-2" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "hidden md:block border-t border-b",
            theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-gray-50/50 border-gray-100",
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
                      "px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all duration-200",
                      isActive
                        ? `${themeColors.activeNavBg} ${themeColors.activeNavText}`
                        : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                          : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                    )}
                  >
                    <div
                      className={cn(
                        "p-1 rounded",
                        isActive
                          ? `bg-gradient-to-r ${themeColors.bgGradient} text-white`
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "md:hidden overflow-hidden z-40 border-b shadow-lg",
              theme === "dark"
                ? "bg-gray-900/95 backdrop-blur-md border-gray-800"
                : "bg-white/95 backdrop-blur-md border-gray-100",
            )}
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navItems.map((item, index) => {
                const isActive = typeof window !== "undefined" && isLinkActive(item.href)
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={cn("mt-4 pt-4 border-t", theme === "dark" ? "border-gray-800" : "border-gray-200")}
              >
                <div className="flex justify-between items-center px-3 py-2">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Tema del Header</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeColorTheme("green")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-green-600 to-green-500 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Verde"
                    />
                    <button
                      onClick={() => changeColorTheme("blue")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Azul"
                    />
                    <button
                      onClick={() => changeColorTheme("purple")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Púrpura"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center px-3 py-2">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Modo de Visualización</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center",
                        theme === "light"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      )}
                      aria-label="Modo Claro"
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center",
                        theme === "dark"
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      )}
                      aria-label="Modo Oscuro"
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center",
                        theme === "system"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      )}
                      aria-label="Modo Sistema"
                    >
                      <Laptop className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-800"
                >
                  <Button
                    onClick={handleLogout}
                    className={`w-full bg-gradient-to-r ${themeColors.bgGradient} hover:opacity-90 text-white rounded-xl py-3`}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
