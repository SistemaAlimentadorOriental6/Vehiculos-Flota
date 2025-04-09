"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Smartphone,
  Bluetooth,
  Link,
  Check,
  PhoneIcon as WhatsApp,
  Loader2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

interface Image {
  id: string
  url: string
  view: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  images: Image[]
  vehicleName: string
}

export default function ShareModal({ isOpen, onClose, images, vehicleName }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"social" | "dispositivos" | "enlace">("social")
  const [copied, setCopied] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [canShare, setCanShare] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [downloadedImages, setDownloadedImages] = useState<File[]>([])
  const { toast } = useToast()
  const isMobile = useMobile()

  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(!!navigator.share && !!navigator.canShare)
  }, [])

  // Preload images as files when modal opens
  useEffect(() => {
    if (isOpen && images.length > 0) {
      preloadImagesAsFiles()
    }
    return () => {
      // Clean up any object URLs when modal closes
      setDownloadedImages([])
    }
  }, [isOpen, images])

  const preloadImagesAsFiles = async () => {
    setIsLoading(true)
    try {
      const files = await Promise.all(
        images.map(async (image, index) => {
          try {
            const response = await fetch(image.url)
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)

            const blob = await response.blob()
            const fileName = `${vehicleName}_${image.view || index + 1}.jpg`
            return new File([blob], fileName, { type: blob.type || "image/jpeg" })
          } catch (error) {
            console.error("Error downloading image:", error)
            return null
          }
        }),
      )

      setDownloadedImages(files.filter(Boolean) as File[])
    } catch (error) {
      console.error("Error preloading images:", error)
      toast({
        title: "Error",
        description: "No se pudieron preparar las imágenes para compartir",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    // Create a text with all image URLs
    const links = images.map((img) => img.url).join("\n")
    navigator.clipboard.writeText(links)
    setCopied(true)

    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
      duration: 2000,
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleSharePlatform = async (platform: string) => {
    setSelectedPlatform(platform)
    setIsLoading(true)

    try {
      // Prepare share data
      const shareTitle = `Imágenes de Vehículo #${vehicleName}`
      const shareText = `Compartiendo ${images.length} ${images.length === 1 ? "imagen" : "imágenes"} de Vehículo #${vehicleName}`

      // For native sharing with Web Share API
      if (platform === "native" && downloadedImages.length > 0) {
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          files: downloadedImages,
        }

        // Check if we can share with files
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData)
          toast({
            title: "Compartido con éxito",
            description: "Las imágenes han sido compartidas correctamente",
            duration: 2000,
          })
          onClose()
          return
        }
      }

      // Platform specific sharing
      switch (platform) {
        case "whatsapp":
          if (downloadedImages.length > 0) {
            // For WhatsApp, we'll download the first image and then open WhatsApp
            const firstFile = downloadedImages[0]
            const fileUrl = URL.createObjectURL(firstFile)

            // Create a temporary link to download the file
            const link = document.createElement("a")
            link.href = fileUrl
            link.download = firstFile.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Open WhatsApp with text
            setTimeout(() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
            }, 500)

            toast({
              title: "Imagen descargada",
              description: "Ahora puedes adjuntar la imagen en WhatsApp",
              duration: 3000,
            })

            // Revoke the URL to free memory
            setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
            onClose()
            return
          } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
          }
          break

        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
            "_blank",
          )
          break

        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`,
            "_blank",
          )
          break

        case "instagram":
          // Instagram doesn't have a direct share URL, download the image for the user
          if (downloadedImages.length > 0) {
            const firstFile = downloadedImages[0]
            const fileUrl = URL.createObjectURL(firstFile)

            const link = document.createElement("a")
            link.href = fileUrl
            link.download = firstFile.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
              title: "Imagen descargada",
              description: "Ahora puedes compartir la imagen en Instagram",
              duration: 3000,
            })

            setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
          } else {
            toast({
              title: "Compartir en Instagram",
              description: "Descarga las imágenes y compártelas en Instagram",
              duration: 3000,
            })
          }
          break

        default:
          // For other platforms, copy to clipboard
          navigator.clipboard.writeText(window.location.href)
          toast({
            title: "Enlace copiado",
            description: "Comparte el enlace en tu aplicación favorita",
            duration: 2000,
          })
      }

      // Close modal after a delay
      setTimeout(() => {
        setSelectedPlatform(null)
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error al compartir",
        description: "No se pudo compartir el contenido. Intenta copiar el enlace manualmente.",
        variant: "destructive",
        duration: 3000,
      })
      setSelectedPlatform(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to download all images at once
  const handleDownloadAll = async () => {
    setIsLoading(true)

    try {
      for (const file of downloadedImages) {
        const url = URL.createObjectURL(file)
        const link = document.createElement("a")
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      toast({
        title: "Descarga completada",
        description: `Se han descargado ${downloadedImages.length} imágenes`,
        duration: 2000,
      })
    } catch (error) {
      console.error("Error downloading images:", error)
      toast({
        title: "Error de descarga",
        description: "No se pudieron descargar algunas imágenes",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const socialPlatforms = [
    { id: "whatsapp", name: "WhatsApp", icon: <WhatsApp className="h-5 w-5" />, color: "bg-green-500" },
    { id: "facebook", name: "Facebook", icon: <Facebook className="h-5 w-5" />, color: "bg-blue-600" },
    { id: "instagram", name: "Instagram", icon: <Instagram className="h-5 w-5" />, color: "bg-pink-600" },
    { id: "twitter", name: "Twitter", icon: <Twitter className="h-5 w-5" />, color: "bg-sky-500" },
  ]

  const devicePlatforms = [
    { id: "bluetooth", name: "Bluetooth", icon: <Bluetooth className="h-5 w-5" />, color: "bg-blue-700" },
    { id: "nearby", name: "Compartir Cercano", icon: <Smartphone className="h-5 w-5" />, color: "bg-purple-600" },
  ]

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Compartir imágenes</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Image thumbnails */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {images.length} {images.length === 1 ? "imagen" : "imágenes"} de Vehículo #{vehicleName}
              </h3>
              <ScrollArea className="h-24">
                <div className="flex gap-2">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200"
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.view}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Sharing options */}
            <div className="p-4 flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
                  <p className="text-gray-600">Preparando imágenes...</p>
                </div>
              ) : (
                <>
                  {downloadedImages.length > 0 && (
                    <div className="mb-4 flex flex-col gap-2">
                      {canShare && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                          onClick={() => handleSharePlatform("native")}
                        >
                          <Share className="h-4 w-4" />
                          <span>Compartir con imágenes</span>
                        </Button>
                      )}

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                        onClick={handleDownloadAll}
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar todas las imágenes</span>
                      </Button>
                    </div>
                  )}

                  <Tabs
                    defaultValue="social"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "social" | "dispositivos" | "enlace")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="social">Redes Sociales</TabsTrigger>
                      <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
                      <TabsTrigger value="enlace">Copiar Enlace</TabsTrigger>
                    </TabsList>

                    <div className="py-2">
                      {activeTab === "social" && (
                        <div className="grid grid-cols-2 gap-3">
                          {socialPlatforms.map((platform) => (
                            <Button
                              key={platform.id}
                              variant="outline"
                              className={`flex items-center justify-start gap-3 h-12 ${
                                selectedPlatform === platform.id ? "border-green-500 ring-1 ring-green-500" : ""
                              }`}
                              onClick={() => handleSharePlatform(platform.id)}
                              disabled={isLoading}
                            >
                              <div className={`${platform.color} text-white p-1.5 rounded-md`}>{platform.icon}</div>
                              <span>{platform.name}</span>
                              {selectedPlatform === platform.id && isLoading ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                </motion.div>
                              ) : selectedPlatform === platform.id ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-auto bg-green-100 text-green-600 p-1 rounded-full"
                                >
                                  <Check className="h-3 w-3" />
                                </motion.div>
                              ) : null}
                            </Button>
                          ))}
                        </div>
                      )}

                      {activeTab === "dispositivos" && (
                        <div className="grid grid-cols-2 gap-3">
                          {devicePlatforms.map((platform) => (
                            <Button
                              key={platform.id}
                              variant="outline"
                              className={`flex items-center justify-start gap-3 h-12 ${
                                selectedPlatform === platform.id ? "border-green-500 ring-1 ring-green-500" : ""
                              }`}
                              onClick={() => handleSharePlatform(platform.id)}
                              disabled={isLoading}
                            >
                              <div className={`${platform.color} text-white p-1.5 rounded-md`}>{platform.icon}</div>
                              <span>{platform.name}</span>
                              {selectedPlatform === platform.id && isLoading ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                </motion.div>
                              ) : selectedPlatform === platform.id ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-auto bg-green-100 text-green-600 p-1 rounded-full"
                                >
                                  <Check className="h-3 w-3" />
                                </motion.div>
                              ) : null}
                            </Button>
                          ))}
                        </div>
                      )}

                      {activeTab === "enlace" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Link className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <div className="text-sm text-gray-600 truncate flex-1">
                              {images.length === 1 ? images[0].url : `${images.length} enlaces de imágenes`}
                            </div>
                          </div>
                          <Button
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleCopyLink}
                            disabled={copied || isLoading}
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                <span>¡Copiado al portapapeles!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>Copiar {images.length > 1 ? "enlaces" : "enlace"}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tabs>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
