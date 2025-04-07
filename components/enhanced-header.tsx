"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Camera, Menu, X, Bell, Search, User, ChevronDown, Settings, LogOut, Home, Image, FileText } from "lucide-react"
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
} from "@/components/ui/dropdown-menu"

export default function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState<"default" | "blue" | "dark">("default")
  const { scrollY } = useScroll()

  const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const headerHeight = useTransform(scrollY, [0, 80], ["80px", "70px"])
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.9])
  const headerShadowOpacity = useTransform(scrollY, [0, 80], [0, 0.1])

  useEffect(() => {
    setIsMounted(true)

    // Simular cargar un tema guardado
    const savedTheme = localStorage.getItem("header-theme") as "default" | "blue" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const changeTheme = (newTheme: "default" | "blue" | "dark") => {
    setTheme(newTheme)
    localStorage.setItem("header-theme", newTheme)
  }

  const getThemeColors = () => {
    switch (theme) {
      case "blue":
        return {
          bgGradient: "from-blue-600 to-blue-500",
          textColor: "text-blue-500",
          hoverBg: "hover:bg-blue-50",
          hoverText: "hover:text-blue-800",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-500",
        }
      case "dark":
        return {
          bgGradient: "from-gray-800 to-gray-700",
          textColor: "text-gray-300",
          hoverBg: "hover:bg-gray-700",
          hoverText: "hover:text-white",
          iconBg: "bg-gray-700",
          iconColor: "text-gray-300",
        }
      default:
        return {
          bgGradient: "from-green-600 to-green-500",
          textColor: "text-green-500",
          hoverBg: "hover:bg-green-50",
          hoverText: "hover:text-green-800",
          iconBg: "bg-green-100",
          iconColor: "text-green-500",
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

  const navItems = [
    { name: "Inicio", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Captura", href: "/", icon: <Camera className="h-4 w-4" /> },
    { name: "Galería", href: "/dashboard?view=gallery", icon: <Image className="h-4 w-4" /> },
    { name: "Reportes", href: "#", icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <>
      <motion.header
        style={{
          height: headerHeight,
          backgroundColor:
            theme === "dark" ? "rgb(31, 41, 55)" : `rgba(255, 255, 255, ${isMounted ? headerBgOpacity.get() : 0})`,
          boxShadow: `0 0 10px rgba(0, 0, 0, ${isMounted ? headerShadowOpacity.get() : 0})`,
        }}
        className={cn(
          "sticky top-0 z-50 flex items-center justify-between px-4 md:px-6",
          theme === "dark" ? "text-white" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              style={{ scale: logoScale }}
              whileHover={{ rotate: 5 }}
              className={`bg-gradient-to-r ${themeColors.bgGradient} p-2 rounded-xl shadow-md`}
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
                className={`text-xs ${themeColors.textColor}`}
              >
                Sistema profesional de documentación
              </motion.p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
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
                      ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
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
                className={cn("p-2 rounded-full", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Notifications */}
          <div className="relative">
            <button className={cn("p-2 rounded-full", theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100")}>
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center`}
                >
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
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
                )}
              >
                <Settings className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tema del Header</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeTheme("default")}>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-600 to-green-500 mr-2" />
                Verde (Default)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeTheme("blue")}>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 mr-2" />
                Azul
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeTheme("dark")}>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 mr-2" />
                Oscuro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 p-1 rounded-full",
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
                )}
              >
                <div
                  className={`h-8 w-8 rounded-full bg-gradient-to-r ${themeColors.bgGradient} flex items-center justify-center text-white font-medium`}
                >
                  C
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
              <DropdownMenuItem>
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
      </motion.header>

      {/* Navigation Bar */}
      <div
        className={cn(
          "hidden md:flex justify-center border-b py-1 px-4",
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
        )}
      >
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors",
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn("md:hidden overflow-hidden z-40", theme === "dark" ? "bg-gray-800" : "bg-white")}
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                      : `text-gray-700 ${themeColors.hoverBg} ${themeColors.hoverText}`,
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className={cn("p-2 rounded-md", theme === "dark" ? "bg-gray-700" : themeColors.iconBg)}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}

              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center px-3 py-2">
                  <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Tema del Header</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeTheme("default")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-green-600 to-green-500 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Verde"
                    />
                    <button
                      onClick={() => changeTheme("blue")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Azul"
                    />
                    <button
                      onClick={() => changeTheme("dark")}
                      className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-white dark:border-gray-800"
                      aria-label="Tema Oscuro"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

