# API del servidor de imágenes

La aplicación consume un servidor HTTP externo en `https://imagenesflota.sao6.com.co`. El código de ese servidor **no está en este repositorio**. Este documento describe lo que la aplicación envía y espera recibir, deducido de `lib/api-service.ts`. Si el servidor cambia, este contrato debe revisarse.

La URL base está en `lib/api-service.ts`:

```ts
const API_BASE_URL = "https://imagenesflota.sao6.com.co"
```

## Resumen de endpoints

| Método | Ruta | Usado por | Descripción |
|---|---|---|---|
| `POST` | `/upload/` | `uploadPhoto` | Sube una foto de una vista de un vehículo. |
| `GET` | `/folders` | `getFolders` | Lista las carpetas. |
| `GET` | `/vehicles/{folderId}` | `getVehiclesInFolder` | Lista los vehículos de una carpeta. |
| `GET` | `/images/{vehicleId}` | `getVehicleImages` | Lista las imágenes de un vehículo. |
| `GET` | `/images/{vehicleId}/{filename}` | Construcción de URLs | Descarga una imagen concreta. |

Ninguna petición envía cabeceras de autenticación ni cookies explícitas. Véase la sección [Seguridad](#seguridad).

---

## `POST /upload/`

Sube una fotografía.

**Petición:** `multipart/form-data`

| Campo | Tipo | Descripción |
|---|---|---|
| `file` | archivo (`image/jpeg`) | Foto. Nombre de archivo: `<vista>.jpg`, con `<vista>` uno de `frontal`, `izquierdo`, `posterior`, `derecho`. |
| `vehiculo` | texto | Número de vehículo (1–261 en la interfaz). |

La URL se envía con barra final (`/upload/`). El código sigue redirecciones (`redirect: 'follow'`).

**Tiempo límite:** 15 segundos por foto, con `AbortController`.

**Respuesta esperada:** `2xx` con JSON. El contenido se devuelve como `data` y la aplicación no lo interpreta. Si la respuesta no es `2xx`, la aplicación lee el texto y muestra los primeros 100 caracteres como error (`Error <status>: ...`).

**Ejemplo:**

```bash
curl -X POST https://imagenesflota.sao6.com.co/upload/ \
  -F "file=@frontal.jpg;type=image/jpeg" \
  -F "vehiculo=12"
```

> Este ejemplo solo ilustra el formato de la petición. No se ha ejecutado contra el servidor real.

---

## `GET /folders`

Lista las carpetas disponibles.

**Respuesta preferida:**

```json
{
  "folders": [
    { "id": "2025-04", "name": "Abril 2025", "count": 37 }
  ]
}
```

**Otras formas aceptadas por el cliente:**

- `{ "error": "mensaje" }`: la aplicación lo trata como fallo y muestra el mensaje.
- Cualquier objeto sin `folders`: se recorre cada propiedad cuyo valor sea un array. Cada una se convierte en carpeta, con `id` = nombre de la propiedad, `name` = el mismo nombre con la primera letra en mayúscula, y `count` = longitud del array.

---

## `GET /vehicles/{folderId}`

Lista los vehículos de una carpeta.

**Respuesta preferida:**

```json
{
  "vehicles": [
    { "id": "12", "name": "Vehículo #12", "date": "2025-04-07", "images": 4 }
  ]
}
```

**Otras formas aceptadas:** un array directo. Para cada elemento, el cliente toma:

| Campo final | Campos que prueba, en orden |
|---|---|
| `id` | `id`, `vehiculo` |
| `name` | `name`, o `Vehículo #<id>` |
| `date` | `date`, `fecha`, o la fecha actual (`AAAA-MM-DD`) |
| `images` | `images`, `imagenes`, o `4` |

Si la respuesta no tiene `vehicles` ni es un array, la aplicación devuelve `Formato de respuesta inesperado`.

---

## `GET /images/{vehicleId}`

Lista las imágenes de un vehículo.

**Respuesta preferida:**

```json
{
  "images": [
    {
      "id": "12-frontal",
      "view": "Frontal",
      "url": "https://imagenesflota.sao6.com.co/images/12/frontal.jpg",
      "date": "2025-04-07",
      "filename": "frontal.jpg"
    }
  ]
}
```

**Otras formas aceptadas:** un array directo. Si `view` no viene, se deduce del nombre de archivo cuando contiene `frontal`, `izquierdo`, `posterior` o `derecho` (se traducen a `Frontal`, `Lateral Izquierdo`, `Posterior` y `Lateral Derecho`).

### Normalización de URLs de imagen

La aplicación no usa la URL tal cual la devuelve el servidor. `normalizeImageUrl` aplica estas reglas en orden:

1. Si la URL empieza por la base del servidor, se le añade `?t=<timestamp>` (o `&t=` si ya tenía parámetros).
2. Si es una URL `https://` de otro host, se conserva solo la ruta y se reconstruye sobre la base del servidor, con `?t=`.
3. Si hay `filename`, se construye `https://imagenesflota.sao6.com.co/images/<vehicleId>/<filename>?t=<timestamp>`.
4. Si la URL es relativa, se antepone la base del servidor.
5. Si nada de lo anterior aplica, se devuelve `/placeholder.svg`.

El parámetro `t` evita que el navegador sirva una versión en caché de la imagen.

---

## Errores y códigos

| Situación | Comportamiento de la aplicación |
|---|---|
| Respuesta no `2xx` | Devuelve `{ success: false, message }` con el estado y el texto recibido. |
| Tiempo límite (solo en subida) | Mensaje de error de conexión. |
| Fallo de red (`Failed to fetch`) | Se reemplaza el mensaje por `Error de conexión con el servidor`. |
| JSON con forma inesperada | `Formato de respuesta inesperado` o listas vacías, sin lanzar excepción. |

## Seguridad

- **Sin autenticación en las peticiones.** La aplicación no envía tokens. Si el servidor no exige autenticación por su cuenta, cualquiera con la URL puede subir o listar imágenes. Esta es la principal limitación del sistema y debe resolverse en el servidor.
- **HTTPS.** `uploadPhoto` comprueba que la base empiece por `https://` y rechaza la subida si no es así.
- **Cabeceras de subida.** `uploadPhoto` envía `Content-Security-Policy` y `Origin`. No aportan seguridad (véase el [README](../README.md#limitaciones-conocidas)).
- **Comentario obsoleto.** La cabecera de `lib/api-service.ts` menciona `https://192.168.90.33/api`, que no es la URL que se usa.
