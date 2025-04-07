// Crear un hook personalizado para gestionar notificaciones

"use client"

import { useState, useCallback } from "react"
import type { Notification } from "@/components/notification-toast"

let notificationId = 0

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = `notification-${notificationId++}`
    setNotifications((prev) => [...prev, { ...notification, id }].slice(-3)) // Limitar a 3 notificaciones máximo

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

