// Si el archivo no existe o no exporta useMediaQuery correctamente, crearlo
"use client"

import { useState, useEffect } from "react"

// Hook genérico para media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatch = () => setMatches(media.matches)

    updateMatch()
    media.addEventListener("change", updateMatch)

    return () => media.removeEventListener("change", updateMatch)
  }, [query])

  return matches
}

const MOBILE_BREAKPOINT = 768

// Hook para detectar si es móvil usando media query
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

// Alternativa de hook para detectar móvil con resize (útil si no se quiere usar media query)
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}
