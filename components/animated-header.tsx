"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Camera, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AnimatedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { scrollY } = useScroll()

  const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const headerHeight = useTransform(scrollY, [0, 80], ["80px", "70px"])
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.9])
  const headerShadowOpacity = useTransform(scrollY, [0, 80], [0, 0.1]) // Extraer este hook fuera de la condición

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  const title = "SAO6 - Flota Vehículos"

  return (
    <>
      <motion.header
        style={{
          height: headerHeight,
          backgroundColor: `rgba(255, 255, 255, ${isMounted ? headerBgOpacity.get() : 0})`,
          boxShadow: `0 0 10px rgba(0, 0, 0, ${isMounted ? headerShadowOpacity.get() : 0})`, // Usar la variable en lugar de llamar al hook
        }}
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6"
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            style={{ scale: logoScale }}
            whileHover={{ rotate: 5 }}
            className="bg-gradient-to-r from-green-600 to-green-500 p-2 rounded-xl shadow-md"
          >
            <Camera className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-xl flex">
              {title.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className={char === "-" ? "mx-1" : ""}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-xs text-green-500"
            >
              Sistema profesional de documentación
            </motion.p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50" asChild>
              <Link href="/">Captura</Link>
            </Button>
            <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">
              Reportes
            </Button>
            <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">
              Configuración
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0,
        }}
        className="md:hidden overflow-hidden bg-white z-40"
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
            asChild
          >
            <Link href="/">Captura</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
          >
            Reportes
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
          >
            Configuración
          </Button>
        </div>
      </motion.div>
    </>
  )
}

