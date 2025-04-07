"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirigir al dashboard si está autenticado, o al login si no lo está
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Mostrar un indicador de carga mientras se redirige
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">Redirigiendo...</p>
      </div>
    </div>
  )
}

