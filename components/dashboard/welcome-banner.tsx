"use client"

import { motion } from "framer-motion"
import { Camera, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WelcomeBannerProps {
  userName: string
  greeting: string
}

export default function WelcomeBanner({ userName, greeting }: WelcomeBannerProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white p-6 sm:p-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Círculos decorativos */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold mb-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {greeting} <span className="text-green-100">{userName}</span>
          </motion.h1>

          <motion.p
            className="text-green-100 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Bienvenido al Sistema de Control de Flota Vehicular. Gestiona y documenta tu flota de manera eficiente.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            className="bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all"
            asChild
          >
            <Link href="/captura">
              <Camera className="mr-2 h-4 w-4" />
              Nueva Captura
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

