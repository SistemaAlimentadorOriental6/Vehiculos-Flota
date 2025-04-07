"use client"

import { motion } from "framer-motion"
import { Camera, CheckCircle, Clock, Car, Upload, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  title: string
  time: string
  description: string
  icon: "camera" | "check" | "clock" | "car" | "upload" | "user"
  status?: "success" | "pending" | "warning"
}

interface ActivityTimelineProps {
  items: TimelineItem[]
}

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
  // Función para renderizar el icono correcto
  const renderIcon = (icon: string, status = "success") => {
    const iconClasses = cn(
      "h-5 w-5",
      status === "success"
        ? "text-green-500"
        : status === "pending"
          ? "text-amber-500"
          : status === "warning"
            ? "text-rose-500"
            : "text-gray-500",
    )

    switch (icon) {
      case "camera":
        return <Camera className={iconClasses} />
      case "check":
        return <CheckCircle className={iconClasses} />
      case "clock":
        return <Clock className={iconClasses} />
      case "car":
        return <Car className={iconClasses} />
      case "upload":
        return <Upload className={iconClasses} />
      case "user":
        return <User className={iconClasses} />
      default:
        return <CheckCircle className={iconClasses} />
    }
  }

  // Variantes para animaciones
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
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {items.map((item, index) => (
          <motion.div key={item.id} className="flex gap-3" variants={itemVariants}>
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                item.status === "success"
                  ? "bg-green-100"
                  : item.status === "pending"
                    ? "bg-amber-100"
                    : item.status === "warning"
                      ? "bg-rose-100"
                      : "bg-gray-100",
              )}
            >
              {renderIcon(item.icon, item.status)}
            </div>

            <div className="flex-1 pt-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-800">{item.title}</h4>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>

              {index < items.length - 1 && <div className="ml-4 mt-1 mb-1 w-0.5 h-3 bg-gray-200"></div>}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

