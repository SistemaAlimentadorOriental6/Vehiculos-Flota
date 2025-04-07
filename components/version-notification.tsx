"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Info, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"

// Definición de versiones de la aplicación
const APP_VERSIONS = [
  {
    id: "v1.0.0",
    title: "¡Bienvenido al Sistema SAO6!",
    description: "Sistema profesional de documentación de flota vehicular. Disfruta de todas las funcionalidades.",
    date: "07/04/2025",
    type: "welcome"
  },
  {
    id: "v1.1.0",
    title: "Nueva versión disponible",
    description: "Hemos mejorado la interfaz de usuario y añadido nuevas funcionalidades de captura.",
    date: "07/04/2025",
    type: "update"
  },
  {
    id: "v1.2.0",
    title: "Actualización de seguridad",
    description: "Se ha implementado un nuevo sistema de autenticación y mejorado la seguridad general.",
    date: "07/04/2025",
    type: "security"
  }
]

// Tiempo de expiración de las cookies en días
const COOKIE_EXPIRATION = 30

export default function VersionNotification() {
  const [activeNotification, setActiveNotification] = useState<typeof APP_VERSIONS[0] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Verificar qué notificaciones no ha visto el usuario
    const checkNotifications = () => {
      const unreadNotifications = APP_VERSIONS.filter(version => {
        const hasSeenCookie = Cookies.get(`sao6_seen_${version.id}`)
        return !hasSeenCookie
      })
      
      setUnreadCount(unreadNotifications.length)
      
      // Si hay notificaciones no leídas, mostrar la más reciente
      if (unreadNotifications.length > 0) {
        setActiveNotification(unreadNotifications[0])
        setIsOpen(true)
      }
    }
    
    // Esperar un momento antes de mostrar la notificación para mejor UX
    const timer = setTimeout(checkNotifications, 1500)
    return () => clearTimeout(timer)
  }, [])

  const dismissNotification = () => {
    if (activeNotification) {
      // Guardar en cookies que esta notificación ya fue vista
      Cookies.set(`sao6_seen_${activeNotification.id}`, "true", { expires: COOKIE_EXPIRATION })
      
      setIsOpen(false)
      
      // Actualizar contador de notificaciones no leídas
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Después de cerrar, verificar si hay más notificaciones para mostrar
      setTimeout(() => {
        const nextUnread = APP_VERSIONS.find(version => {
          const hasSeenCookie = Cookies.get(`sao6_seen_${version.id}`)
          return !hasSeenCookie && version.id !== activeNotification.id
        })
        
        if (nextUnread) {
          setActiveNotification(nextUnread)
          setIsOpen(true)
        } else {
          setActiveNotification(null)
        }
      }, 300)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "welcome":
        return <Bell className="h-5 w-5 text-green-500" />
      case "update":
        return <Info className="h-5 w-5 text-blue-500" />
      case "security":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-green-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800"
      case "update":
        return "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
      case "security":
        return "bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800"
      default:
        return "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800"
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg overflow-hidden"
          >
            <div className={`p-4 border ${getNotificationColor(activeNotification.type)}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(activeNotification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activeNotification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {activeNotification.date}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {activeNotification.description}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={dismissNotification}
                      className="text-xs"
                    >
                      Entendido
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={dismissNotification}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicador de notificaciones no leídas para el header */}
      {unreadCount > 0 && (
        <div className="hidden">
          {/* Este div solo almacena el contador para que pueda ser accedido por otros componentes */}
          <span id="unread-notifications-count">{unreadCount}</span>
        </div>
      )}
    </>
  )
}
