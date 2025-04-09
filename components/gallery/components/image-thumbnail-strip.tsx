"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Image {
  id: string
  url: string
  view: string
}

interface ImageThumbnailStripProps {
  images: Image[]
  currentIndex: number
  onSelect: (index: number, e?: React.MouseEvent) => void
}

export default function ImageThumbnailStrip({ images, currentIndex, onSelect }: ImageThumbnailStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(false)

  // Check if we need to show scroll buttons
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return

      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current

      setShowScrollButtons(scrollWidth > clientWidth)
      setShowLeftButton(scrollLeft > 0)
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
    }

    checkScroll()
    window.addEventListener("resize", checkScroll)

    // Observe scroll events to update button visibility
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll)
    }

    return () => {
      window.removeEventListener("resize", checkScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScroll)
      }
    }
  }, [images])

  // Scroll to the current thumbnail when current index changes
  useEffect(() => {
    if (scrollContainerRef.current && images.length > 0) {
      const thumbnailWidth = 90 // Width + gap
      const scrollPosition = currentIndex * thumbnailWidth - 100

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [currentIndex, images.length])

  // Handlers for the scroll buttons
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative py-3 px-4 border-t border-gray-800/60 backdrop-blur-md bg-black/60"
    >
      {/* Left scroll button */}
      {showScrollButtons && showLeftButton && (
        <button
          onClick={scrollLeft}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right scroll button */}
      {showScrollButtons && showRightButton && (
        <button
          onClick={scrollRight}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div className="relative overflow-hidden px-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 pt-1 snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              layoutId={`thumbnail-${image.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative h-16 w-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden snap-center transition-all duration-200",
                currentIndex === index
                  ? "ring-2 ring-green-500 shadow-lg"
                  : "opacity-70 hover:opacity-100 ring-1 ring-white/10",
              )}
              onClick={(e) => {
                e.stopPropagation() // Stop event propagation
                onSelect(index, e)
              }}
            >
              <img src={image.url || "/placeholder.svg"} alt={image.view} className="h-full w-full object-cover" />

              {currentIndex === index && (
                <motion.div
                  layoutId="thumbnailHighlighter"
                  className="absolute inset-0 bg-green-500/20 border-2 border-green-500 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
