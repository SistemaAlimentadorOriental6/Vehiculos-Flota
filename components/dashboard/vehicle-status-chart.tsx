"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VehicleStatusChartProps {
  data: {
    label: string
    value: number
    color: string
  }[]
  title?: string
}

export default function VehicleStatusChart({ data, title = "Estado de Vehículos" }: VehicleStatusChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map((item) => ({ ...item, value: 0 })))

  // Calcular el total para los porcentajes
  const total = data.reduce((acc, item) => acc + item.value, 0)

  // Animar los valores
  useEffect(() => {
    const duration = 1500 // duración en ms
    const steps = 30 // número de pasos para la animación
    const stepTime = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep += 1
      const progress = currentStep / steps
      // Función de easing: easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)

      setAnimatedData(
        data.map((item) => ({
          ...item,
          value: Math.floor(eased * item.value),
        })),
      )

      if (currentStep >= steps) {
        setAnimatedData(data)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [data])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      <div className="space-y-4">
        {animatedData.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-sm font-semibold"
                  >
                    {item.value}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-xs text-gray-500"
                  >
                    ({percentage}%)
                  </motion.span>
                </div>
              </div>

              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", item.color)}
                  initial={{ width: "0%" }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

