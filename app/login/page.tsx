"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import {
  User,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
  Car,
  Truck,
  Bike,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function EnhancedLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [bgVehicles, setBgVehicles] = useState<
    Array<{ type: string; x: number; y: number; scale: number; rotation: number }>
  >([])

  const passwordStrength = useRef(0)
  const usernameControls = useAnimation()
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, login } = useAuth()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Generate background vehicles
  useEffect(() => {
    const vehicles = []
    const vehicleTypes = ["car", "truck", "bike"]
    for (let i = 0; i < 12; i++) {
      vehicles.push({
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
      })
    }
    setBgVehicles(vehicles)
  }, [])

  // Password strength calculation
  useEffect(() => {
    if (password.length === 0) {
      passwordStrength.current = 0
      return
    }

    let strength = 0
    // Length check
    if (password.length >= 8) strength += 0.25
    // Contains number
    if (/\d/.test(password)) strength += 0.25
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 0.25
    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) strength += 0.25

    passwordStrength.current = strength
  }, [password])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Check if credentials were stored
  useEffect(() => {
    const storedUsername = localStorage.getItem("sao6_remembered_username")
    if (storedUsername) {
      setUsername(storedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    setFormError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!username.trim()) {
      setFormError("El nombre de usuario es requerido")
      usernameControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 },
      })
      return
    }

    if (!password.trim()) {
      setFormError("La contraseña es requerida")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Check credentials (in a real app, use API call)
      if (username === "sao6" && password === "sao62025") {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("sao6_remembered_username", username)
        } else {
          localStorage.removeItem("sao6_remembered_username")
        }

        setFormError(null)
        setLoginSuccess(true)

        // Short delay to show success animation before redirect
        setTimeout(() => {
          login(username)
          router.push("/dashboard")
        }, 1000)
      } else {
        setFormError("Credenciales inválidas. Por favor, intenta de nuevo.")

        // Reset form with animation
        if (formRef.current) {
          formRef.current.classList.add("shake")
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.classList.remove("shake")
            }
          }, 500)
        }
      }
      setIsLoading(false)
    }, 1500)
  }

  const getPasswordStrengthClass = () => {
    const strength = passwordStrength.current
    if (strength === 0) return "bg-gray-200 dark:bg-gray-700"
    if (strength <= 0.25) return "bg-red-500"
    if (strength <= 0.5) return "bg-orange-500"
    if (strength <= 0.75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // Function to render vehicle icon
  const renderVehicleIcon = (type: string) => {
    switch (type) {
      case "car":
        return <Car className="text-green-500/20 dark:text-green-500/10" />
      case "truck":
        return <Truck className="text-blue-500/20 dark:text-blue-500/10" />
      case "bike":
        return <Bike className="text-purple-500/20 dark:text-purple-500/10" />
      default:
        return <Car className="text-green-500/20 dark:text-green-500/10" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 z-0" />

      {/* Animated background vehicles */}
      {bgVehicles.map((vehicle, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${vehicle.x}%`,
            top: `${vehicle.y}%`,
            transform: `scale(${vehicle.scale}) rotate(${vehicle.rotation}deg)`,
            zIndex: 0,
            opacity: 0.5,
          }}
          animate={{
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            duration: 20 + Math.random() * 20,
          }}
        >
          <div className="w-10 h-10 md:w-16 md:h-16">{renderVehicleIcon(vehicle.type)}</div>
        </motion.div>
      ))}

      {/* Theme Switcher */}
      <motion.button
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 text-center">
          <motion.div
            variants={itemVariants}
            className="inline-block p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-400 dark:from-green-500 dark:to-green-700 mb-6 shadow-xl"
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
            >
              <KeyRound className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400"
          >
            SAO6 - Flota Vehicular
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300">
            Accede al sistema profesional de documentación
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-400 dark:from-green-500 dark:to-green-700 p-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <LogIn className="h-5 w-5 mr-2" />
              Iniciar Sesión
            </h2>
            <p className="text-green-100 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <motion.form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Username Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario
              </label>
              <div className="relative">
                <motion.div animate={usernameControls} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu nombre de usuario"
                    value={username}
                    onChange={handleUsernameChange}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500"
                    disabled={isLoading || loginSuccess}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500"
                  disabled={isLoading || loginSuccess}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading || loginSuccess}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.div>
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-1">
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${passwordStrength.current * 100}%` }}
                      className={cn("h-full", getPasswordStrengthClass())}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Fuerza:{" "}
                    {passwordStrength.current < 0.5 ? "Débil" : passwordStrength.current < 1 ? "Moderada" : "Fuerte"}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start"
                >
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me Checkbox */}
            <motion.div variants={itemVariants} className="flex items-center">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="sr-only"
                  disabled={isLoading || loginSuccess}
                />
                <div
                  className={cn(
                    "w-5 h-5 border rounded mr-2 flex items-center justify-center transition-colors",
                    rememberMe
                      ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600"
                      : "border-gray-300 dark:border-gray-600",
                  )}
                  onClick={() => !isLoading && !loginSuccess && setRememberMe(!rememberMe)}
                >
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Recordar usuario
                </label>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base rounded-xl transition-all",
                  loginSuccess
                    ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    : "bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 dark:from-green-500 dark:to-green-700",
                )}
                disabled={isLoading || loginSuccess}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Verificando...</span>
                  </div>
                ) : loginSuccess ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Acceso Exitoso</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    <span>Iniciar Sesión</span>
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Footer */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-8 text-center">
          <motion.p variants={itemVariants} className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SAO6 - Sistema Profesional de Documentación
          </motion.p>
          <motion.p variants={itemVariants} className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Versión 2.0.1 - Todos los derechos reservados
          </motion.p>
        </motion.div>
      </div>

      {/* Add dynamic blobs */}
      <div className="hidden md:block">
        <motion.div
          className="absolute top-1/3 -left-32 w-96 h-96 bg-green-300/20 dark:bg-green-900/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-300/30 dark:bg-blue-900/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* CSS for shake animation */}
      <style jsx global>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  )
}
