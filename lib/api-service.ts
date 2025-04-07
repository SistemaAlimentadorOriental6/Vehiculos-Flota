// Servicio API para conectar directamente con la API de producción en https://192.168.90.33/api

// URL base de la API de producción
const API_BASE_URL = "https://imagenesflota.sao6.com.co"

/**
 * Convierte una imagen base64 a un archivo Blob
 */
export function base64ToBlob(base64: string, mimeType = "image/jpeg"): Blob {
  // Eliminar el prefijo de data URL si existe
  const base64Data = base64.includes("base64,") ? base64.split("base64,")[1] : base64

  // Convertir base64 a array de bytes
  const byteCharacters = atob(base64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: mimeType })
}

/**
 * Obtiene el nombre de la vista según el ID
 */
export function getViewFileName(viewId: number): string {
  switch (viewId) {
    case 1:
      return "frontal"
    case 2:
      return "izquierdo"
    case 3:
      return "posterior"
    case 4:
      return "derecho"
    default:
      return `vista_${viewId}`
  }
}

/**
 * Sube una foto al servidor de producción
 */
export async function uploadPhoto(
  photoData: string,
  vehicleId: string,
  viewName: string,
  onProgress?: (progress: number, status: "uploading" | "success" | "error", message?: string) => void,
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Notificar inicio de carga
    onProgress?.(0, "uploading")

    // Crear una función para simular el progreso ya que fetch no tiene eventos de progreso nativos
    const simulateProgress = () => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress > 90) {
          clearInterval(interval)
          progress = 90 // Mantener en 90% hasta que se complete
        }
        onProgress?.(Math.min(progress, 90), "uploading")
      }, 300)
      return interval
    }

    const progressInterval = simulateProgress()

    // Convertir la imagen base64 a Blob
    const blob = base64ToBlob(photoData)

    // Crear un objeto FormData para enviar la imagen
    const formData = new FormData()
    formData.append("file", blob, `${viewName}.jpg`)
    formData.append("vehiculo", vehicleId)

    // Hacer la solicitud a la API de producción
    const response = await fetch('https://imagenesflota.sao6.com.co/upload', {
      method: "POST",
      body: formData,
    })

    // Detener la simulación de progreso
    clearInterval(progressInterval)

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: `Error ${response.status}: ${response.statusText}` }))

      const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`
      onProgress?.(100, "error", errorMessage)

      throw new Error(errorMessage)
    }

    // Notificar éxito con 100%
    onProgress?.(100, "success")

    // Devolver la respuesta del servidor
    const data = await response.json()
    return {
      success: true,
      message: data.message || "Imagen guardada con éxito",
      data,
    }
  } catch (error) {
    console.error("Error al subir la imagen:", error)

    const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir la imagen"
    onProgress?.(100, "error", errorMessage)

    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * Sube todas las fotos de un vehículo al servidor de producción
 */
export async function uploadAllPhotos(
  photos: { [key: number]: string },
  vehicleId: string,
  onProgress?: (viewId: number, progress: number, status: "uploading" | "success" | "error", message?: string) => void,
): Promise<{ success: boolean; message: string; results: any[] }> {
  try {
    const results = []
    const photoIds = Object.keys(photos).map((id) => Number.parseInt(id))

    // Verificar que tenemos las 4 fotos
    if (photoIds.length !== 4) {
      return {
        success: false,
        message: "Se requieren las 4 vistas del vehículo para guardar",
        results: [],
      }
    }

    // Subir cada foto secuencialmente
    for (const viewId of photoIds) {
      const viewName = getViewFileName(viewId)

      // Crear una función de progreso específica para esta vista
      const viewProgressCallback = onProgress
        ? (progress: number, status: "uploading" | "success" | "error", message?: string) => {
            onProgress(viewId, progress, status, message)
          }
        : undefined

      const result = await uploadPhoto(photos[viewId], vehicleId, viewName, viewProgressCallback)

      results.push({
        viewId,
        viewName,
        ...result,
      })

      // Si alguna falla, detener el proceso
      if (!result.success) {
        return {
          success: false,
          message: `Error al subir la vista ${viewName}: ${result.message}`,
          results,
        }
      }

      // Añadir un pequeño retraso entre cargas para mejor visualización
      if (viewId !== photoIds[photoIds.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    return {
      success: true,
      message: "Todas las imágenes se guardaron correctamente",
      results,
    }
  } catch (error) {
    console.error("Error al subir las imágenes:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al subir las imágenes",
      results: [],
    }
  }
}

/**
 * Obtiene las carpetas de vehículos disponibles del servidor de producción
 */
export async function getFolders(): Promise<{
  success: boolean
  folders?: { id: string; name: string; count: number }[]
  message?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Verificar si la respuesta tiene la estructura esperada
    if (data.folders) {
      return {
        success: true,
        folders: data.folders,
      }
    } else if (data.error) {
      return {
        success: false,
        message: data.error,
        folders: [],
      }
    } else {
      // Si la estructura es diferente, intentar adaptarla
      const folders = []

      // Intentar extraer carpetas de la estructura antigua si existe
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && key !== "error") {
          folders.push({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            count: (value as any[]).length,
          })
        }
      }

      return {
        success: true,
        folders: folders,
      }
    }
  } catch (error) {
    console.error("Error al obtener carpetas:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al obtener carpetas",
      folders: [],
    }
  }
}

/**
 * Obtiene los vehículos dentro de una carpeta del servidor de producción
 */
export async function getVehiclesInFolder(folderId: string): Promise<{
  success: boolean
  vehicles?: { id: string; name: string; date: string; images: number }[]
  message?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${folderId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Verificar si la respuesta tiene la estructura esperada
    if (data.vehicles) {
      return {
        success: true,
        vehicles: data.vehicles,
      }
    } else {
      // Intentar adaptar la respuesta si tiene una estructura diferente
      // Por ejemplo, si la API devuelve directamente un array de vehículos
      if (Array.isArray(data)) {
        const vehicles = data.map((vehicle: any) => ({
          id: vehicle.id || vehicle.vehiculo || "",
          name: vehicle.name || `Vehículo #${vehicle.id || vehicle.vehiculo || ""}`,
          date: vehicle.date || vehicle.fecha || new Date().toISOString().split("T")[0],
          images: vehicle.images || vehicle.imagenes || 4,
        }))

        return {
          success: true,
          vehicles,
        }
      }

      return {
        success: false,
        message: "Formato de respuesta inesperado",
        vehicles: [],
      }
    }
  } catch (error) {
    console.error(`Error al obtener vehículos de la carpeta ${folderId}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al obtener vehículos",
      vehicles: [],
    }
  }
}

/**
 * Normaliza una URL para asegurarse de que sea absoluta y apunte al servidor correcto
 */
function normalizeImageUrl(url: string, vehicleId: string, filename?: string): string {
  // Si la URL ya es absoluta y apunta al servidor correcto, devolverla
  if (url && url.startsWith(API_BASE_URL)) {
    // Añadir timestamp para evitar caché
    return url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
  }
  
  // Si la URL es absoluta pero apunta a otro servidor (como 127.0.0.1), corregirla
  if (url && (url.startsWith('https://') || url.startsWith('https://'))) {
    // Extraer la ruta relativa
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      // Construir la URL correcta con el API_BASE_URL
      const correctedUrl = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
      return `${correctedUrl}?t=${Date.now()}`
    } catch (e) {
      console.error("Error al parsear URL:", e)
    }
  }

  // Si tenemos un nombre de archivo, construir la URL
  if (filename) {
    return `${API_BASE_URL}/images/${vehicleId}/${filename}?t=${Date.now()}`
  }

  // Si la URL es relativa, convertirla en absoluta
  if (url && !url.startsWith('https')) {
    return `${API_BASE_URL}/${url.startsWith('/') ? url.substring(1) : url}?t=${Date.now()}`
  }

  // Si no hay URL válida, devolver una URL de placeholder
  return `/placeholder.svg?t=${Date.now()}`
}

/**
 * Obtiene las imágenes de un vehículo específico del servidor de producción
 */
export async function getVehicleImages(vehicleId: string): Promise<{
  success: boolean
  images?: { id: string; view: string; url: string; date: string; filename?: string }[]
  message?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${vehicleId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Verificar si la respuesta tiene la estructura esperada
    if (data.images) {
      // Asegurarse de que cada imagen tenga una URL válida
      const images = data.images.map((image: any) => {
        // Normalizar la URL para asegurar que apunte al servidor correcto
        const imageUrl = normalizeImageUrl(image.url, vehicleId, image.filename)

        return {
          id: image.id || `${vehicleId}-${image.filename || image.view}`,
          view: image.view || "Desconocida",
          url: imageUrl,
          date: image.date || new Date().toISOString().split("T")[0],
          filename: image.filename,
        }
      })

      return {
        success: true,
        images: images,
      }
    } else if (Array.isArray(data)) {
      // Si la API devuelve directamente un array de imágenes
      const images = data.map((image: any) => {
        // Normalizar la URL para asegurar que apunte al servidor correcto
        const imageUrl = normalizeImageUrl(image.url, vehicleId, image.filename)

        // Mapear el nombre de archivo a una vista
        let viewName = image.view || "Desconocida"
        const filename = image.filename || ""

        if (!viewName && filename) {
          if (filename.includes("frontal")) viewName = "Frontal"
          else if (filename.includes("izquierdo")) viewName = "Lateral Izquierdo"
          else if (filename.includes("posterior")) viewName = "Posterior"
          else if (filename.includes("derecho")) viewName = "Lateral Derecho"
        }

        return {
          id: image.id || `${vehicleId}-${filename || viewName}`,
          view: viewName,
          url: imageUrl,
          date: image.date || image.fecha || new Date().toISOString().split("T")[0],
          filename: filename,
        }
      })

      return {
        success: true,
        images,
      }
    } else {
      return {
        success: false,
        message: "Formato de respuesta inesperado",
        images: [],
      }
    }
  } catch (error) {
    console.error(`Error al obtener imágenes del vehículo ${vehicleId}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al obtener imágenes",
      images: [],
    }
  }
}

/**
 * Función para depurar URLs de imágenes
 * Esta función imprime información detallada sobre una URL para ayudar a diagnosticar problemas
 */
export function debugImageUrl(url: string, vehicleId: string, filename?: string): void {
  console.group("Depuración de URL de imagen")
  console.log("URL original:", url)
  console.log("ID del vehículo:", vehicleId)
  console.log("Nombre del archivo:", filename)
  
  const normalizedUrl = normalizeImageUrl(url, vehicleId, filename)
  console.log("URL normalizada:", normalizedUrl)
  
  try {
    const urlObj = new URL(url)
    console.log("Protocolo:", urlObj.protocol)
    console.log("Host:", urlObj.host)
    console.log("Ruta:", urlObj.pathname)
    console.log("Parámetros:", urlObj.search)
  } catch (e) {
    console.log("La URL no es válida o es relativa")
  }
  
  console.log("API_BASE_URL:", API_BASE_URL)
  console.groupEnd()
}
