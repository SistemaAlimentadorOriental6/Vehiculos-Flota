"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Home,
  Image,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Palette,
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
    { name: "Inicio", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Captura", href: "/captura", icon: <Camera className="h-4 w-4" /> },
    { name: "Galería", href: "/dashboard?view=gallery", icon: <Image className="h-4 w-4" /> },
  ]

  // Verificar si el enlace está activo
  const isLinkActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (href === "/captura" && pathname === "/captura") {
      return true
    }
    if (
      href === "/dashboard?view=gallery" &&
      pathname === "/dashboard" &&
      typeof window !== "undefined" &&
      window.location.search.includes("view=gallery")
    ) {
      return true
    }
    return false
  }

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full border-b",
          theme === "dark" ? "bg-gray-950 border-gray-800 text-white" : "bg-white border-gray-100",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn("bg-gradient-to-r p-2 rounded-xl shadow-md", themeColors.bgGradient)}
              >
                <Camera className="h-6 w-6 text-white" />
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
                      "w-full h-9 px-3 py-2 text-sm rounded-md border",
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        : "bg-white border-gray-200",
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
                  className={cn("p-2 rounded-full", theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100")}
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Notifications */}
            <div className="relative">
              <button className={cn("p-2 rounded-full", theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100")}>
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "p-2 rounded-full hidden md:flex",
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Personalización</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="h-4 w-4 mr-2" />
                    <span>Color del Tema</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => changeColorTheme("green")}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-600 to-green-500 mr-2" />
                        Verde (Default)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeColorTheme("blue")}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 mr-2" />
                        Azul
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeColorTheme("purple")}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 mr-2" />
                        Púrpura
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeColorTheme("amber")}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 mr-2" />
                        Ámbar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeColorTheme("rose")}>
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 mr-2" />
                        Rosa
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
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
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="h-4 w-4 mr-2" />
                        Claro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="h-4 w-4 mr-2" />
                        Oscuro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Laptop className="h-4 w-4 mr-2" />
                        Sistema
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ayuda y Soporte
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 p-1 rounded-full",
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium",
                      `bg-gradient-to-r ${themeColors.bgGradient}`,
                    )}
                  >
                    {user ? user.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div
          className={cn(
            "hidden md:block border-t",
            theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100",
          )}
        >
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors",
                    isLinkActive(item.href)
                      ? `bg-${colorTheme}-100 text-${colorTheme}-700 dark:bg-${colorTheme}-900/20 dark:text-${colorTheme}-300`
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn("md:hidden overflow-hidden z-40", theme === "dark" ? "bg-gray-900" : "bg-white")}
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    isLinkActive(item.href)
                      ? `bg-${colorTheme}-50 text-${colorTheme}-700 dark:bg-${colorTheme}-900/30 dark:text-${colorTheme}-300`
                      : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className={cn("p-2 rounded-md", theme === "dark" ? "bg-gray-800" : themeColors.iconBg)}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}

              <div className={cn("mt-2 pt-2 border-t", theme === "dark" ? "border-gray-800" : "border-gray-200")}>
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

                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

