"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, FileDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

interface Image {
  id: string
  url: string
  view: string
}

interface DownloadOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  images: Image[]
  vehicleName: string
}

export default function DownloadOptionsModal({ isOpen, onClose, images, vehicleName }: DownloadOptionsModalProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>(images.map((img) => img.id))
  const [downloadFormat, setDownloadFormat] = useState<"original" | "zip">("original")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const toggleAllImages = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(images.map((img) => img.id))
    }
  }

  // Modificar la función handleDownload para mejorar la experiencia en móviles
  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    // Filter selected images
    const imagesToDownload = images.filter((img) => selectedImages.includes(img.id))

    if (downloadFormat === "zip") {
      // Simulate zip download with progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          clearInterval(interval)
          progress = 100
          setTimeout(() => {
            setIsDownloading(false)
            onClose()
          }, 500)
        }
        setDownloadProgress(progress)
      }, 300)
    } else {
      // Download individual files
      for (let i = 0; i < imagesToDownload.length; i++) {
        const img = imagesToDownload[i]
        // Update progress
        setDownloadProgress(((i + 1) / imagesToDownload.length) * 100)

        try {
          // Create a fetch request to get the image
          const response = await fetch(img.url)
          if (!response.ok) throw new Error(`Error downloading image: ${response.statusText}`)

          const blob = await response.blob()

          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob)

          // Create a temporary link and trigger download
          const link = document.createElement("a")
          link.href = url
          link.download = `${vehicleName}_${img.view}.jpg`
          document.body.appendChild(link)
          link.click()

          // Clean up
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
        } catch (error) {
          console.error("Error downloading image:", error)
          toast({
            title: "Error de descarga",
            description: `No se pudo descargar la imagen ${img.view}`,
            variant: "destructive",
            duration: 3000,
          })
        }

        // Add a small delay between downloads
        if (i < imagesToDownload.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }

      // Complete
      setTimeout(() => {
        setIsDownloading(false)
        onClose()

        toast({
          title: "Descarga completada",
          description: `Se han descargado ${imagesToDownload.length} imágenes`,
          duration: 3000,
        })
      }, 500)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Descargar imágenes</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isDownloading ? (
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="mb-4 text-center">
                  <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">Descargando imágenes</h3>
                  <p className="text-gray-500 text-sm">Por favor, espere mientras se completa la descarga</p>
                </div>
                <Progress value={downloadProgress} className="w-full h-2 mb-2" />
                <p className="text-sm text-gray-500">{Math.round(downloadProgress)}% completado</p>
              </div>
            ) : (
              <>
                {/* Image selection */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Seleccionar imágenes</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={toggleAllImages}>
                      {selectedImages.length === images.length
                        ? "Deseleccionar todo"
                        : `Seleccionar todo (${images.length})`}
                    </Button>
                  </div>

                  <ScrollArea className="h-48 border rounded-md border-gray-200 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className={`relative rounded-md overflow-hidden border ${
                            selectedImages.includes(image.id)
                              ? "border-green-500 ring-1 ring-green-500"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              id={`image-${image.id}`}
                              checked={selectedImages.includes(image.id)}
                              onCheckedChange={() => toggleImageSelection(image.id)}
                              className="bg-white/90 border-gray-300 data-[state=checked]:bg-green-500"
                            />
                          </div>
                          {selectedImages.includes(image.id) && (
                            <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                          )}
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.view}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-2 bg-white">
                            <p className="text-xs font-medium truncate">{image.view}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Download options */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Opciones de descarga</h3>

                  <RadioGroup
                    value={downloadFormat}
                    onValueChange={(value) => setDownloadFormat(value as "original" | "zip")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="original" id="format-original" />
                      <Label htmlFor="format-original" className="flex items-center gap-2">
                        <FileDown className="h-4 w-4 text-gray-500" />
                        <span>Archivos individuales</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="zip" id="format-zip" />
                      <Label htmlFor="format-zip" className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-gray-500" />
                        <span>Archivo ZIP comprimido</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Actions */}
                <div className="p-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleDownload} disabled={selectedImages.length === 0} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span>
                      Descargar {selectedImages.length} {selectedImages.length === 1 ? "imagen" : "imágenes"}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
