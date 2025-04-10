"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  Shield,
  Star,
  Bookmark,
  MessageSquare,
  LayoutDashboard,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  Sliders,
  ChevronRight,
  CircleUser,
  Cog,
  BellRing,
  Users,
  Dot,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import { useMobile } from "@/hooks/use-mobile"

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
  const isMobile = useMobile()

  const { scrollY } = useScroll()
  const headerBgOpacity = useTransform(scrollY, [0, 100], [0.8, 1])
  const headerShadow = useTransform(scrollY, [0, 100], ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 40px rgba(0,0,0,0.15)"])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95])

  useEffect(() => {
    setIsMounted(true)

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

    const checkUnreadNotifications = () => {
      let unreadCount = 0

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

    const interval = setInterval(checkUnreadNotifications, 60000)

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }

      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [searchOpen])

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
          borderColor: "border-blue-200 dark:border-blue-800",
          fillColor: "fill-blue-500",
          accentColor: "accent-blue-500",
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
          borderColor: "border-purple-200 dark:border-purple-800",
          fillColor: "fill-purple-500",
          accentColor: "accent-purple-500",
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
          borderColor: "border-amber-200 dark:border-amber-800",
          fillColor: "fill-amber-500",
          accentColor: "accent-amber-500",
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
          borderColor: "border-rose-200 dark:border-rose-800",
          fillColor: "fill-rose-500",
          accentColor: "accent-rose-500",
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
          borderColor: "border-teal-200 dark:border-teal-800",
          fillColor: "fill-teal-500",
          accentColor: "accent-teal-500",
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
          borderColor: "border-cyan-200 dark:border-cyan-800",
          fillColor: "fill-cyan-500",
          accentColor: "accent-cyan-500",
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
          borderColor: "border-green-200 dark:border-green-800",
          fillColor: "fill-green-500",
          accentColor: "accent-green-500",
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
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Captura", href: "/captura", icon: <Camera className="h-4 w-4" /> },
    { name: "Galería", href: "/dashboard?view=gallery", icon: <ImageIcon className="h-4 w-4" /> },
  ]

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

  // Variants for animations
  const mobileMenuVariants = {
    closed: { x: "100%" },
    open: { x: 0 },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const staggerChildrenVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  const shimmerVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: "200%",
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 1,
      },
    },
  }

  // CSS para el patrón de fondo
  const bgPatternStyle = {
    backgroundSize: "20px 20px",
    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
    backgroundPosition: "0 0",
  }

  const notificationItems = [
    {
      id: 1,
      title: "Nueva versión disponible",
      description: "Actualización v1.2.0 con mejoras de seguridad",
      time: "Hace 2 horas",
      icon: <Star className="h-4 w-4 text-white" />,
      color: "from-amber-400 to-amber-300",
      shadow: "shadow-amber-500/20",
      isNew: true,
    },
    {
      id: 2,
      title: "Bienvenido al sistema",
      description: "Explora todas las funcionalidades disponibles",
      time: "Hace 1 día",
      icon: <Bookmark className="h-4 w-4 text-white" />,
      color: `${themeColors.lightGradient}`,
      shadow: `${themeColors.shadowColor}`,
      isNew: true,
    },
    {
      id: 3,
      title: "Mantenimiento programado",
      description: "El sistema estará en mantenimiento el próximo viernes",
      time: "Hace 3 días",
      icon: <Cog className="h-4 w-4 text-white" />,
      color: "from-gray-400 to-gray-300",
      shadow: "shadow-gray-500/20",
      isNew: false,
    },
  ]

  return (
    <>
      <motion.header
        ref={headerRef}
        style={{
          boxShadow: isMounted ? headerShadow : "none",
          backgroundColor:
            theme === "dark"
              ? "rgba(3, 7, 18, 0.95)"
              : `rgba(255, 255, 255, ${isMounted ? headerBgOpacity.get() : 0.95})`,
        }}
        className={cn(
          "sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300",
          theme === "dark" ? "border-b border-gray-800/50 text-white" : "border-b border-gray-200/50",
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <motion.div
                  style={{ scale: logoScale }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl shadow-lg",
                    theme === "dark" ? "shadow-black/30" : "shadow-gray-400/30",
                  )}
                >
                  <div className={cn("bg-gradient-to-br p-2.5 relative z-10", themeColors.bgGradient)}>
                    <Camera className="h-6 w-6 text-white" />
                  </div>

                  {/* Animated background effects */}
                  <motion.div className="absolute inset-0 bg-white/20" variants={pulseVariants} animate="pulse" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    variants={shimmerVariants}
                    initial="hidden"
                    animate="visible"
                  />

                  {/* Glow effect on hover */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      `bg-gradient-to-br ${themeColors.bgGradient} blur-xl`,
                    )}
                  />
                </motion.div>

                <div className="hidden sm:block">
                  <h1 className="font-bold text-xl flex space-x-0.5 tracking-tight">
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
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className={cn("h-0.5 rounded-full mt-0.5 bg-gradient-to-r", themeColors.bgGradient)}
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className={cn("text-xs font-medium mt-1", themeColors.textColor, themeColors.darkText)}
                  >
                    Sistema profesional de documentación
                  </motion.p>
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search button/bar */}
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: isMobile ? 220 : 320, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="relative"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none",
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
                        "w-full h-10 pl-10 pr-10 py-2 text-sm rounded-full border-2 focus:outline-none focus:ring-2 transition-all duration-200",
                        theme === "dark"
                          ? `bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-400 focus:${themeColors.ringColor} focus:ring-offset-gray-900`
                          : `bg-gray-50/80 border-gray-200 focus:${themeColors.ringColor} focus:ring-offset-white`,
                        themeColors.borderColor,
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
                          "ml-1 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200",
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
                      "relative p-2.5 rounded-full transition-all duration-300 flex items-center gap-1",
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                    )}
                    onClick={() => setSearchOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs font-medium ml-1 mr-1">
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

                    {/* Subtle glow effect */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300",
                        theme === "dark" ? "bg-gray-400" : `bg-gradient-to-r ${themeColors.bgGradient}`,
                        "blur-sm",
                      )}
                    />
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
                      "relative p-2.5 rounded-full transition-all duration-300",
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                        className={cn(
                          "absolute -top-1 -right-1 flex items-center justify-center",
                          "w-5 h-5 rounded-full text-xs font-bold text-white",
                          `bg-gradient-to-br ${themeColors.bgGradient} ${themeColors.shadowColor}`,
                          "shadow-lg",
                        )}
                      >
                        {notifications}
                      </motion.div>
                    )}

                    {/* Subtle glow effect */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300",
                        theme === "dark" ? "bg-gray-400" : `bg-gradient-to-r ${themeColors.bgGradient}`,
                        "blur-sm",
                      )}
                    />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "w-[350px] p-0 overflow-hidden rounded-xl shadow-xl",
                    theme === "dark" ? "bg-gray-900/95 border border-gray-800" : "bg-white/95 border border-gray-200",
                    "backdrop-blur-xl",
                  )}
                  forceMount
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("relative overflow-hidden")}
                  >
                    {/* Header with background pattern */}
                    <div className={cn("p-4 relative", `bg-gradient-to-r ${themeColors.bgGradient}`)}>
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                          </pattern>
                          <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                      </div>

                      <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <BellRing className="h-4 w-4" />
                          Centro de Notificaciones
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                            {notifications} nuevas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-gray-800">
                      <button
                        className={cn(
                          "flex-1 py-2.5 px-4 text-sm font-medium relative",
                          "text-white bg-gradient-to-r",
                          themeColors.bgGradient,
                        )}
                      >
                        Recientes
                        <motion.div
                          layoutId="notificationTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        />
                      </button>
                      <button
                        className={cn(
                          "flex-1 py-2.5 px-4 text-sm font-medium",
                          theme === "dark" ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Todas
                      </button>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications > 0 ? (
                        <motion.div
                          className="p-1"
                          variants={staggerChildrenVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {notificationItems.map((item) => (
                            <motion.div
                              key={item.id}
                              variants={childVariants}
                              className={cn(
                                "p-3 m-1 rounded-lg cursor-pointer transition-all duration-200",
                                theme === "dark"
                                  ? "bg-gray-800/80 hover:bg-gray-750"
                                  : "bg-gray-50/90 hover:bg-gray-100",
                                item.isNew && (theme === "dark" ? "ring-1 ring-gray-700" : "ring-1 ring-gray-200"),
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-full bg-gradient-to-r", item.color, item.shadow)}>
                                  {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={cn(
                                        "text-sm font-medium truncate",
                                        theme === "dark" ? "text-white" : "text-gray-900",
                                      )}
                                    >
                                      {item.title}
                                    </p>
                                    {item.isNew && (
                                      <span
                                        className={cn(
                                          "text-xs px-1.5 py-0.5 rounded-full ml-2 whitespace-nowrap",
                                          theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700",
                                        )}
                                      >
                                        Nueva
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                                  <div className="flex items-center mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {item.time}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="p-8 text-center"
                        >
                          <div
                            className={cn(
                              "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                              theme === "dark" ? "bg-gray-800" : "bg-gray-100",
                              themeColors.textColor,
                            )}
                          >
                            <Bell className="h-8 w-8" />
                          </div>
                          <h4
                            className={cn(
                              "text-base font-medium mb-1",
                              theme === "dark" ? "text-white" : "text-gray-900",
                            )}
                          >
                            No hay notificaciones
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                            Cuando recibas notificaciones, aparecerán aquí
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className={cn("p-2 border-t", theme === "dark" ? "border-gray-800" : "border-gray-100")}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-center text-xs font-medium",
                          theme === "dark"
                            ? "border-gray-800 hover:bg-gray-800 text-gray-300"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700",
                        )}
                      >
                        Ver todas las notificaciones
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative p-2.5 rounded-full transition-all duration-300 hidden md:flex",
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                    )}
                  >
                    <Settings className="h-5 w-5" />

                    {/* Subtle glow effect */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300",
                        theme === "dark" ? "bg-gray-400" : `bg-gradient-to-r ${themeColors.bgGradient}`,
                        "blur-sm",
                      )}
                    />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "w-[280px] p-2 rounded-xl shadow-xl",
                    theme === "dark" ? "bg-gray-900/95 border border-gray-800" : "bg-white/95 border border-gray-200",
                    "backdrop-blur-xl",
                  )}
                  forceMount
                >
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownMenuLabel
                      className={cn(
                        "px-2 py-1.5 text-base font-semibold",
                        theme === "dark" ? "text-white" : "text-gray-900",
                      )}
                    >
                      Configuración
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger
                          className={cn(
                            "flex items-center gap-2 rounded-lg my-1 cursor-pointer",
                            theme === "dark"
                              ? "hover:bg-gray-800 focus:bg-gray-800"
                              : "hover:bg-gray-100 focus:bg-gray-100",
                          )}
                        >
                          <div className={cn("p-1.5 rounded-md", themeColors.iconBg, themeColors.iconColor)}>
                            <Palette className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-gray-900")}>
                              Tema de Color
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Personaliza los colores del sistema
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent
                            className={cn(
                              "p-1 rounded-lg shadow-xl min-w-[180px]",
                              theme === "dark"
                                ? "bg-gray-900/95 border border-gray-800"
                                : "bg-white/95 border border-gray-200",
                              "backdrop-blur-xl",
                            )}
                          >
                            <DropdownMenuRadioGroup
                              value={colorTheme}
                              onValueChange={(value) => changeColorTheme(value as any)}
                            >
                              {[
                                { value: "green", label: "Verde" },
                                { value: "blue", label: "Azul" },
                                { value: "purple", label: "Púrpura" },
                                { value: "amber", label: "Ámbar" },
                                { value: "rose", label: "Rosa" },
                                { value: "teal", label: "Teal" },
                                { value: "cyan", label: "Cian" },
                              ].map((item) => (
                                <DropdownMenuRadioItem
                                  key={item.value}
                                  value={item.value}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md cursor-pointer py-1.5 px-2",
                                    theme === "dark"
                                      ? "hover:bg-gray-800 focus:bg-gray-800"
                                      : "hover:bg-gray-100 focus:bg-gray-100",
                                    "data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "h-4 w-4 rounded-full bg-gradient-to-r",
                                      `from-${item.value}-600 to-${item.value}-500`,
                                    )}
                                  />
                                  <span className={cn("text-sm", theme === "dark" ? "text-white" : "text-gray-900")}>
                                    {item.label}
                                  </span>
                                  {colorTheme === item.value && <Check className="h-4 w-4 ml-auto text-gray-500" />}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger
                          className={cn(
                            "flex items-center gap-2 rounded-lg my-1 cursor-pointer",
                            theme === "dark"
                              ? "hover:bg-gray-800 focus:bg-gray-800"
                              : "hover:bg-gray-100 focus:bg-gray-100",
                          )}
                        >
                          <div
                            className={cn(
                              "p-1.5 rounded-md",
                              theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",
                            )}
                          >
                            {theme === "dark" ? (
                              <Moon className="h-4 w-4" />
                            ) : theme === "light" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Laptop className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-gray-900")}>
                              Modo de Visualización
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ajusta el tema de la interfaz</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent
                            className={cn(
                              "p-1 rounded-lg shadow-xl min-w-[180px]",
                              theme === "dark"
                                ? "bg-gray-900/95 border border-gray-800"
                                : "bg-white/95 border border-gray-200",
                              "backdrop-blur-xl",
                            )}
                          >
                            <DropdownMenuRadioGroup value={theme || "system"} onValueChange={setTheme}>
                              {[
                                { value: "light", label: "Claro", icon: Sun, color: "amber" },
                                { value: "dark", label: "Oscuro", icon: Moon, color: "blue" },
                                { value: "system", label: "Sistema", icon: Laptop, color: "gray" },
                              ].map((item) => (
                                <DropdownMenuRadioItem
                                  key={item.value}
                                  value={item.value}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md cursor-pointer py-1.5 px-2",
                                    theme === "dark"
                                      ? "hover:bg-gray-800 focus:bg-gray-800"
                                      : "hover:bg-gray-100 focus:bg-gray-100",
                                    "data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "p-1 rounded-md",
                                      `bg-${item.color}-100 dark:bg-${item.color}-900/30`,
                                      `text-${item.color}-500`,
                                    )}
                                  >
                                    <item.icon className="h-4 w-4" />
                                  </div>
                                  <span className={cn("text-sm", theme === "dark" ? "text-white" : "text-gray-900")}>
                                    {item.label}
                                  </span>
                                  {theme === item.value && <Check className="h-4 w-4 ml-auto text-gray-500" />}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      className={cn(
                        "flex items-center gap-2 rounded-lg my-1 cursor-pointer",
                        theme === "dark"
                          ? "hover:bg-gray-800 focus:bg-gray-800"
                          : "hover:bg-gray-100 focus:bg-gray-100",
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-md",
                          theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",
                        )}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-gray-900")}>
                          Ayuda y Soporte
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Accede a recursos de ayuda</p>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 p-1 px-2 rounded-full transition-all duration-300",
                      theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium shadow-lg relative overflow-hidden",
                        `bg-gradient-to-r ${themeColors.bgGradient} ${themeColors.shadowColor}`,
                      )}
                    >
                      {user ? user.charAt(0).toUpperCase() : "U"}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        variants={shimmerVariants}
                        initial="hidden"
                        animate="visible"
                      />
                    </div>
                    <span
                      className={cn(
                        "hidden md:block text-sm font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900",
                      )}
                    >
                      {user || "Usuario"}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden md:block text-gray-400" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "w-[280px] p-0 overflow-hidden rounded-xl shadow-xl",
                    theme === "dark" ? "bg-gray-900/95 border border-gray-800" : "bg-white/95 border border-gray-200",
                    "backdrop-blur-xl",
                  )}
                  forceMount
                >
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("relative p-5", `bg-gradient-to-r ${themeColors.bgGradient}`)}
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="user-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100" height="100" fill="url(#user-grid)" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-lg text-white">{user || "Usuario"}</p>
                        <div className="flex items-center gap-1 text-xs text-white/80 mt-0.5">
                          <Shield className="h-3 w-3" />
                          <span>Administrador</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              "bg-white/20 text-white",
                            )}
                          >
                            <Dot className="h-3 w-3 mr-0.5 text-green-400" />
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { icon: CircleUser, label: "Mi Perfil" },
                        { icon: Sliders, label: "Configuración" },
                        { icon: MessageSquare, label: "Mensajes" },
                        { icon: Users, label: "Usuarios" },
                      ].map((item, index) => (
                        <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <DropdownMenuItem
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg",
                              theme === "dark"
                                ? "hover:bg-gray-800 focus:bg-gray-800"
                                : "hover:bg-gray-100 focus:bg-gray-100",
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-full mb-1.5",
                                `bg-gradient-to-r ${themeColors.lightGradient} ${themeColors.shadowColor}`,
                              )}
                            >
                              <item.icon className="h-4 w-4 text-white" />
                            </div>
                            <span
                              className={cn("text-xs font-medium", theme === "dark" ? "text-white" : "text-gray-900")}
                            >
                              {item.label}
                            </span>
                          </DropdownMenuItem>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-1" />

                  <div className="p-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className={cn(
                          "flex items-center gap-2 m-1 p-2 rounded-lg",
                          "text-red-600 dark:text-red-400",
                          "hover:bg-red-50 dark:hover:bg-red-900/20",
                        )}
                      >
                        <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-500">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </motion.div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "relative p-2.5 rounded-full transition-all duration-300 md:hidden",
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                )}
                aria-label="Abrir menú"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

                {/* Subtle glow effect */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300",
                    theme === "dark" ? "bg-gray-400" : `bg-gradient-to-r ${themeColors.bgGradient}`,
                    "blur-sm",
                  )}
                />
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
          className={cn("hidden md:block relative z-10", theme === "dark" ? "text-white" : "text-gray-900")}
        >
          {/* Decorative background with pattern */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-full",
              theme === "dark"
                ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-r from-gray-50 via-white to-gray-50",
            )}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-[1px]",
                theme === "dark"
                  ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
                  : "bg-gradient-to-r from-transparent via-gray-200 to-transparent",
              )}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <nav className="flex items-center justify-center gap-4 py-2">
              {navItems.map((item, idx) => {
                const isActive = typeof window !== "undefined" && isLinkActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 px-5 py-2.5 overflow-hidden transition-all duration-300",
                      "rounded-xl backdrop-blur-sm",
                      isActive
                        ? theme === "dark"
                          ? `bg-gray-800/80 ${themeColors.textColor} shadow-lg shadow-black/10`
                          : `bg-white/80 ${themeColors.textColor} shadow-lg shadow-gray-200/50`
                        : theme === "dark"
                          ? "text-gray-300 hover:text-white hover:bg-gray-800/40"
                          : `text-gray-700 hover:${themeColors.textColor} hover:bg-white/60`,
                    )}
                  >
                    {/* Animated background for active state */}
                    {isActive && (
                      <motion.div
                        className={cn("absolute inset-0 opacity-10", `bg-gradient-to-r ${themeColors.bgGradient}`)}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.05, 0.15, 0.05],
                          backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      />
                    )}

                    {/* Icon container with animated effects */}
                    <div className="relative">
                      <motion.div
                        className={cn(
                          "flex items-center justify-center p-2 rounded-lg transition-all duration-300",
                          isActive
                            ? `bg-gradient-to-br ${themeColors.bgGradient} text-white shadow-md ${themeColors.shadowColor}`
                            : theme === "dark"
                              ? "bg-gray-800/80"
                              : "bg-gray-100/80",
                        )}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {item.icon}

                        {/* Animated ring effect */}
                        {isActive && (
                          <motion.div
                            className={cn("absolute inset-0 rounded-lg border-2 border-white/20", "opacity-0")}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: [0, 0.5, 0],
                              scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "loop",
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Subtle glow effect */}
                      <motion.div
                        className={cn(
                          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-60",
                          `bg-gradient-to-r ${themeColors.bgGradient}`,
                          "blur-md -z-10",
                        )}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.3 }}
                      />
                    </div>

                    {/* Text with animated underline */}
                    <div className="relative font-medium">
                      {item.name}
                      <motion.div
                        className={cn(
                          "absolute -bottom-1 left-0 h-[2px] w-0 rounded-full",
                          `bg-gradient-to-r ${themeColors.bgGradient}`,
                        )}
                        initial={{ width: "0%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Active indicator with animated dots */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 flex justify-center"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-t-lg",
                            theme === "dark" ? "bg-gray-800" : "bg-white",
                          )}
                        >
                          {[0, 1, 2].map((dot) => (
                            <motion.div
                              key={dot}
                              className={cn("h-1 w-1 rounded-full", `bg-gradient-to-r ${themeColors.bgGradient}`)}
                              initial={{ scale: 0.5 }}
                              animate={{
                                scale: dot === 1 ? [0.5, 1, 0.5] : [0.5, 0.8, 0.5],
                              }}
                              transition={{
                                duration: dot === 1 ? 1.5 : 2,
                                delay: dot * 0.2,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Number indicator for item position */}
                    <div
                      className={cn(
                        "absolute top-1 right-1 text-[8px] font-mono opacity-40",
                        isActive ? "opacity-70" : "opacity-30",
                      )}
                    >
                      0{idx + 1}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "absolute top-0 right-0 bottom-0 w-80 overflow-y-auto shadow-xl rounded-l-2xl",
                theme === "dark" ? "bg-gray-900/95 border-l border-gray-800" : "bg-white/95 border-l border-gray-200",
              )}
            >
              <div
                className={cn(
                  "p-4 flex justify-between items-center border-b",
                  theme === "dark" ? "border-gray-800" : "border-gray-200",
                )}
              >
                <h2 className={cn("font-bold text-lg", theme === "dark" ? "text-white" : "text-gray-900")}>
                  Menú Principal
                </h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "p-4 rounded-xl mb-4 relative overflow-hidden",
                    `bg-gradient-to-r ${themeColors.bgGradient}`,
                  )}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="mobile-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100" height="100" fill="url(#mobile-grid)" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user || "Usuario"}</p>
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <Shield className="h-3 w-3" />
                        <span>Administrador</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={staggerChildrenVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2 pb-4"
                >
                  {navItems.map((item, index) => {
                    const isActive = typeof window !== "undefined" && isLinkActive(item.href)
                    return (
                      <motion.div
                        key={item.name}
                        variants={childVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="overflow-hidden rounded-xl"
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
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
                          {isActive && <Sparkles className="h-4 w-4" />}
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn("mt-6 pt-6 border-t", theme === "dark" ? "border-gray-800" : "border-gray-200")}
                >
                  <div className="space-y-4">
                    <h3 className={cn("text-sm font-medium", theme === "dark" ? "text-gray-400" : "text-gray-500")}>
                      Personalización
                    </h3>

                    <div>
                      <h4 className={cn("text-xs mb-2", theme === "dark" ? "text-gray-400" : "text-gray-500")}>
                        Tema del Header
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["green", "blue", "purple", "amber", "rose", "teal", "cyan"].map((color) => (
                          <motion.button
                            key={color}
                            onClick={() => changeColorTheme(color as any)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`h-8 w-8 rounded-full bg-gradient-to-r from-${color}-600 to-${color}-500 shadow-lg shadow-${color}-500/20 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all duration-200`}
                            style={{
                              ringColor: colorTheme === color ? `var(--${color}-500)` : "transparent",
                            }}
                            aria-label={`Tema ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={cn("text-xs mb-2", theme === "dark" ? "text-gray-400" : "text-gray-500")}>
                        Modo de Visualización
                      </h4>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme("light")}
                          className={cn(
                            "flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "light"
                              ? "bg-amber-100 text-amber-600 ring-2 ring-amber-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Claro"
                        >
                          <Sun className="h-4 w-4" />
                          <span className="text-xs font-medium">Claro</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "dark"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Oscuro"
                        >
                          <Moon className="h-4 w-4" />
                          <span className="text-xs font-medium">Oscuro</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme("system")}
                          className={cn(
                            "flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200",
                            theme === "system"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                          )}
                          aria-label="Modo Sistema"
                        >
                          <Laptop className="h-4 w-4" />
                          <span className="text-xs font-medium">Auto</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={cn("mt-6 pt-6 border-t", theme === "dark" ? "border-gray-800" : "border-gray-200")}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleLogout}
                      className={cn(
                        "w-full bg-gradient-to-r text-white rounded-xl py-3 shadow-lg",
                        themeColors.bgGradient,
                        themeColors.shadowColor,
                        "hover:opacity-90",
                      )}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
