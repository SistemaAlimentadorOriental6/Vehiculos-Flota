// Crear un nuevo componente para notificaciones no intrusivas

"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Notification {
  id: string
  title: string
  message?: string
  type: "success" | "error" | "info"
  duration?: number
}

interface NotificationToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const { id, title, message, type, duration = 3000 } = notification

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={cn("max-w-sm w-full mx-4 mt-2 px-4 py-3 rounded-lg shadow-md border", getBackgroundColor())}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
        </div>
        <button
          type="button"
          className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={() => onDismiss(id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast key={notification.id} notification={notification} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

