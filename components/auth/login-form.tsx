"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validar campos vacíos
    if (!username.trim() || !password.trim()) {
      setError("Por favor ingrese usuario y contraseña")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setIsLoading(false)
      return
    }

    // Simular un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      // Validar credenciales (en un sistema real, esto sería una llamada a la API)
      if (username === "sao6" && password === "sao62025") {
        login(username)
        router.push("/dashboard")
      } else {
        setError("Usuario o contraseña incorrectos")
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden`}
    >
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
        <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
        <p className="text-green-100 text-sm">Ingrese sus credenciales para continuar</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 py-6"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
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
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 py-6"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            <span>Iniciar Sesión</span>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de acceso restringido</p>
        </div>
      </motion.form>
    </motion.div>
  )
}

