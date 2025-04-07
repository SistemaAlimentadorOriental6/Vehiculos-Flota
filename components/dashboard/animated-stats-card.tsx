"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedStatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description?: string
  color: "green" | "blue" | "purple" | "amber" | "rose"
  delay?: number
  prefix?: string
  suffix?: string
}

export default function AnimatedStatsCard({
  title,
  value,
  icon,
  description,
  color = "green",
  delay = 0,
  prefix = "",
  suffix = "",
}: AnimatedStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Colores según la variante
  const colorVariants = {
    green: {
      background: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-100",
      icon: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
      text: "text-green-800",
      value: "text-green-700",
      description: "text-green-600",
    },
    blue: {
      background: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-100",
      icon: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
      text: "text-blue-800",
      value: "text-blue-700",
      description: "text-blue-600",
    },
    purple: {
      background: "bg-gradient-to-br from-purple-50 to-violet-50",
      border: "border-purple-100",
      icon: "bg-gradient-to-br from-purple-500 to-violet-600 text-white",
      text: "text-purple-800",
      value: "text-purple-700",
      description: "text-purple-600",
    },
    amber: {
      background: "bg-gradient-to-br from-amber-50 to-yellow-50",
      border: "border-amber-100",
      icon: "bg-gradient-to-br from-amber-500 to-yellow-600 text-white",
      text: "text-amber-800",
      value: "text-amber-700",
      description: "text-amber-600",
    },
    rose: {
      background: "bg-gradient-to-br from-rose-50 to-pink-50",
      border: "border-rose-100",
      icon: "bg-gradient-to-br from-rose-500 to-pink-600 text-white",
      text: "text-rose-800",
      value: "text-rose-700",
      description: "text-rose-600",
    },
  }

  // Animar el contador
  useEffect(() => {
    const duration = 1500 // duración en ms
    const steps = 30 // número de pasos para la animación
    const stepTime = duration / steps
    let currentStep = 0

    // Si el valor es 0, no animar
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    const timer = setInterval(() => {
      currentStep += 1
      const progress = currentStep / steps
      // Función de easing: easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.floor(eased * value))

      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("rounded-2xl border shadow-sm p-6", colorVariants[color].background, colorVariants[color].border)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={cn("font-medium text-sm mb-1", colorVariants[color].text)}>{title}</h3>
          <div className="flex items-baseline">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
              className={cn("text-3xl font-bold", colorVariants[color].value)}
            >
              {prefix}
              {displayValue.toLocaleString()}
              {suffix}
            </motion.span>
          </div>
          {description && <p className={cn("text-xs mt-1", colorVariants[color].description)}>{description}</p>}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: delay + 0.1,
          }}
          className={cn("p-3 rounded-xl shadow-md", colorVariants[color].icon)}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
}

