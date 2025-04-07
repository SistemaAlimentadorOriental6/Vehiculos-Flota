"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Camera, Home, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

interface CongratulationsModalProps {
  vehicleId: string
  isOpen: boolean
  onClose: () => void
}

export default function CongratulationsModal({ vehicleId, isOpen, onClose }: CongratulationsModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  // Trigger confetti effect when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)

      // Launch confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Navigate to dashboard
  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Success Icon */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-white rounded-full p-3 mb-4 shadow-lg"
              >
                <CheckCircle className="h-12 w-12 text-green-500" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white mb-1"
              >
                ¡Felicidades!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-green-50 text-center"
              >
                Documentación guardada con éxito
              </motion.p>
            </div>

            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Has guardado exitosamente el vehículo #{vehicleId}
                </h3>
                <p className="text-gray-600">
                  Todas las fotos han sido guardadas correctamente en el servidor. Las imágenes están disponibles para
                  su consulta en el sistema.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100"
              >
                <div className="flex items-start">
                  <Upload className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Resumen de guardado</h4>
                    <p className="text-sm text-green-700">
                      Se han guardado las 4 vistas del vehículo: Frontal, Lateral Izquierdo, Posterior y Lateral
                      Derecho.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={goToDashboard}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl py-6"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Ir al Dashboard
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 rounded-xl py-3"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Continuar capturando
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

