"use client"

import { motion } from "framer-motion"
import { Camera, ArrowRight } from "lucide-react"

interface ViewTransitionProps {
  fromView: number
  toView: number
  onComplete: () => void
  containerClass?: string // Añadir prop para clase de contenedor
}

export default function ViewTransition({ fromView, toView, onComplete, containerClass = "" }: ViewTransitionProps) {
  const getViewName = (view: number) => {
    switch (view) {
      case 1:
        return "Frontal"
      case 2:
        return "Lateral Izquierdo"
      case 3:
        return "Posterior"
      case 4:
        return "Lateral Derecho"
      default:
        return "Desconocido"
    }
  }

  return (
    <motion.div
      className={`absolute inset-0 z-30 bg-black/90 flex items-center justify-center ${containerClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(() => {
          onComplete()
        }, 300)
      }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1.1, 1],
          opacity: [0, 1, 1],
          transition: { duration: 0.8, times: [0, 0.6, 1] },
        }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <motion.div
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6"
          animate={{
            rotate: 360,
            transition: { duration: 1.5, ease: "easeInOut" },
          }}
        >
          <Camera className="h-8 w-8 text-white" />
        </motion.div>

        <div className="flex items-center gap-4 mb-8">
          <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{
              x: -20,
              opacity: [1, 0.3, 0],
              transition: { duration: 0.8, times: [0, 0.7, 1] },
            }}
            className="bg-green-700/50 px-4 py-2 rounded-lg text-white font-medium"
          >
            {getViewName(fromView)}
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 0.8, repeat: 1, repeatType: "reverse" },
            }}
          >
            <ArrowRight className="h-6 w-6 text-green-400" />
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: [0, 0.7, 1],
              transition: { duration: 0.8, times: [0, 0.3, 1] },
            }}
            className="bg-green-500 px-4 py-2 rounded-lg text-white font-bold"
          >
            {getViewName(toView)}
          </motion.div>
        </div>

        <motion.div
          className="w-48 h-1.5 bg-green-900/30 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "12rem" }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-green-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

