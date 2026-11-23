# Arquitectura

Este documento describe cómo está organizado el código, cómo fluyen los datos y dónde se guarda el estado. Para instalar y ejecutar el proyecto, véase el [README](../README.md).

## Visión general

La aplicación es una **SPA renderizada con Next.js App Router** que no tiene backend propio. Toda la lógica de negocio corre en el navegador y se comunica directamente con un servidor de imágenes externo (`https://imagenesflota.sao6.com.co`).

```
┌──────────────────────────── Navegador ────────────────────────────┐
│                                                                    │
│  Next.js (App Router)                                              │
│   ├── app/login          ──► credenciales fijas (cliente)          │
│   ├── app/dashboard      ──► RealDataProvider / gallery-view       │
│   └── app/captura        ──► cámara ─► EnhancedCameraInterface     │
│                               │                                    │
│                               ▼                                    │
│                        lib/api-service.ts                          │
│                               │  fetch                             │
│  localStorage / cookies ◄─────┤                                    │
└───────────────────────────────┼────────────────────────────────────┘
                                ▼
                 Servidor de imágenes (imagenesflota.sao6.com.co)
                 POST /upload/ · GET /folders · GET /vehicles/:id · GET /images/:id
```

## Capas

### 1. Rutas (`app/`)

Cada carpeta con `page.tsx` es una ruta. Los archivos `loading.tsx` muestran el estado de carga de Next.js mientras se resuelve la ruta.

| Archivo | Responsabilidad |
|---|---|
| `app/layout.tsx` | Layout raíz. Envuelve la app en `AuthProvider` → `ThemeProvider` → `Toaster`. Define el título y la fuente Inter. |
| `app/page.tsx` | Redirige según la sesión: `/dashboard` o `/login`. |
| `app/login/page.tsx` | Pantalla de acceso, con animaciones, "recordarme" e indicador de fuerza de contraseña. |
| `app/dashboard/page.tsx` | Lee `?view=` para decidir entre la vista de resumen y la galería. Envuelve el contenido en `ProtectedRoute` y `RealDataProvider`. |
| `app/captura/page.tsx` | Orquesta el flujo de captura: número de vehículo, cuatro vistas, resumen y envío. Lee `?id=` de la URL. |
| `app/captura/layout.tsx` | Contenedor sin lógica. |

### 2. Autenticación (`components/auth/`, `hooks/use-auth.ts`)

- **`AuthProvider`** (`components/auth/auth-provider.tsx`) lee `sao6_user` y `sao6_auth_time` de `localStorage` al montarse. Si la sesión tiene menos de 8 horas, marca al usuario como autenticado; si no, borra las claves. No renderiza hijos hasta terminar esa comprobación.
- **`useAuth`** (`hooks/use-auth.ts`) expone el contexto: `isAuthenticated`, `user`, `login(username)`, `logout()`.
- **`ProtectedRoute`** (`components/auth/protected-route.tsx`) muestra "Verificando autenticación..." y redirige a `/login` si no hay sesión.

La validación de credenciales ocurre en `app/login/page.tsx`, dentro de `handleSubmit`, comparando con valores fijos en el código. Tras validar, se llama a `login()` y se navega a `/dashboard`.

### 3. Capa de datos (`lib/api-service.ts`)

Es el único punto de contacto con el servidor. Exporta:

| Función | Uso |
|---|---|
| `uploadPhoto(photoData, vehicleId, viewName, onProgress?)` | Sube una foto en base64 como `multipart/form-data`. |
| `uploadAllPhotos(photos, vehicleId, onProgress?)` | Sube las cuatro vistas en orden, deteniéndose al primer error. |
| `getFolders()` | Lista las carpetas (agrupaciones de vehículos). |
| `getVehiclesInFolder(folderId)` | Lista los vehículos de una carpeta. |
| `getVehicleImages(vehicleId)` | Lista las imágenes de un vehículo, con URL normalizada. |
| `base64ToBlob(base64, mime?)` | Conversión auxiliar; quita el prefijo `data:...;base64,` si existe. |
| `getViewFileName(viewId)` | Traduce 1–4 a `frontal`, `izquierdo`, `posterior`, `derecho`. |
| `debugImageUrl(url, vehicleId, filename?)` | Registra en consola la normalización de una URL, para diagnóstico. |

Las funciones no lanzan excepciones: devuelven `{ success, message, ... }`. Los errores se registran con `console.error`.

El contrato con el servidor está en [`api.md`](api.md).

### 4. Captura (`components/enhanced-camera-interface.tsx`, `components/photo-summary.tsx`)

- **`EnhancedCameraInterface`** pide la cámara con `getUserMedia` (por defecto la trasera, `facingMode: "environment"`), dibuja el fotograma en un `<canvas>` oculto y lo exporta con `toDataURL("image/jpeg", 0.95)`. Permite cambiar de cámara y muestra la silueta del vehículo (`vehicle-outline.tsx`) para guiar el encuadre.
- **`EnhancedPhotoGallery`** muestra las miniaturas de las vistas capturadas. Permite repetir una vista.
- **`PhotoSummary`** es el paso final: muestra progreso de subida por vista, llama a `uploadAllPhotos` y reporta el resultado.

Las fotos viven en el estado de React de `app/captura/page.tsx` (`capturedPhotos: { [viewId]: dataURL }`). No se persisten: si se recarga la página, se pierden.

### 5. Panel y galería (`components/dashboard/`, `components/gallery/`)

- **`RealDataProvider`** (`components/dashboard/real-data-provider.tsx`) es un contexto que carga, en cadena, `getFolders` → `getVehiclesInFolder` por carpeta → `getVehicleImages` del vehículo más reciente. Expone esos datos a los componentes del panel.
- **`VehicleStatusDashboard`** muestra el estado de la flota. Su botón "ver galería" navega a `/dashboard?view=gallery`.
- **`EnhancedGalleryView`** (`components/gallery/gallery-view.tsx`) carga carpetas, vehículos e imágenes, y ofrece búsqueda, filtros, selección múltiple y visor a pantalla completa. Subcomponentes en `components/gallery/components/`:
  - `touch-image-viewer`, `image-viewer-controls`, `mobile-image-controls`: visor y controles táctiles.
  - `image-thumbnail-strip`, `image-preloader`: tira de miniaturas y precarga.
  - `multi-select-toolbar`: acciones sobre varias imágenes.
  - `download-options-modal`, `download-indicator`: descarga; obtiene cada imagen con `fetch`.
  - `share-modal`: comparte por WhatsApp, Facebook, X/Twitter o copiando el enlace.

### 6. Componentes transversales

| Componente | Función |
|---|---|
| `PremiumHeader` (`premium-header.tsx`) | Encabezado usado en captura y panel. Gestiona el tema de color (`header-color-theme`) y el cierre de sesión. |
| `VersionNotification` | Aviso de nuevas versiones, controlado con cookies `sao6_seen_<versión>`. |
| `NotificationContainer` + `useNotifications` | Pila de notificaciones (máximo 3) para la captura. |
| `CongratulationsModal` | Modal que se muestra al completar la captura de un vehículo. |
| `ViewTransition` | Transición animada entre pasos del flujo de captura. |
| `ImageWithLoading` | Imagen con estado de carga, usada en 9 sitios. |
| `components/ui/*` | Biblioteca base (botones, diálogos, formularios, tablas, etc.). |

### 7. Hooks (`hooks/`)

| Hook | Uso |
|---|---|
| `use-auth` | Acceso al contexto de autenticación. |
| `use-toast` / `components/ui/use-toast.ts` | Sistema de toasts usado en la captura para errores de validación. |
| `use-notifications` | Gestiona la pila de notificaciones de la captura. |
| `use-mobile` | Detecta viewport móvil. |

## Almacenamiento en el navegador

Toda la persistencia es local al navegador. No hay base de datos.

| Clave | Tipo | Contenido | Quién la escribe | Caducidad |
|---|---|---|---|---|
| `sao6_user` | localStorage | Nombre de usuario | `AuthProvider.login` | Al cerrar sesión o pasadas 8 h |
| `sao6_auth_time` | localStorage | Marca de tiempo del acceso | `AuthProvider.login` | Igual que la anterior |
| `sao6_remembered_username` | localStorage | Usuario recordado | Pantalla de login | Manual |
| `header-color-theme` | localStorage | Tema de color del encabezado | Encabezado | Manual |
| `recentSearches` | localStorage | Búsquedas recientes de la galería | `gallery-view` | Manual |
| `sao6_seen_<versión>` | cookie | Aviso de versión ya visto | `VersionNotification` | 30 días |

## Flujos principales

### Inicio de sesión

```
/login → handleSubmit → (usuario y contraseña válidos) → login(usuario)
       → localStorage(sao6_user, sao6_auth_time) → router.push("/dashboard")
```

### Captura y envío

```
/captura?id=N ─► validar N (1–261)
             ─► por cada vista 1..4: cámara ─► dataURL JPEG ─► capturedPhotos[vista]
             ─► PhotoSummary ─► uploadAllPhotos(capturedPhotos, N)
                  └─ para cada vista (secuencial):
                       uploadPhoto ─► POST /upload/ (multipart: file, vehiculo)
                       espera 500 ms
             ─► éxito: CongratulationsModal   |   error: toast + detener
```

### Carga del panel

```
/dashboard ─► RealDataProvider
           ─► GET /folders
           ─► por cada carpeta: GET /vehicles/:carpeta
           ─► vehículo más reciente: GET /images/:vehiculo
```

## Decisiones y particularidades

- **Sin backend propio.** El servidor de imágenes es externo y su código no está en este repositorio. Los formatos de respuesta se infieren del cliente y pueden no coincidir con la documentación del servidor.
- **Respuestas tolerantes.** `api-service.ts` acepta varios formatos de respuesta (por ejemplo, `vehiculo`/`id`, `fecha`/`date`, `imagenes`/`images`). Es útil ante cambios del servidor, pero hace menos evidente el contrato real.
- **Subida secuencial.** Las cuatro fotos se suben una a una. Es más lento que en paralelo, pero simplifica el manejo de errores y el progreso.
- **Cache-busting.** Las URLs de imagen llevan `?t=<timestamp>` para evitar caché del navegador.
- **Imágenes sin optimizar.** `images.unoptimized` está activo, así que Next.js no redimensiona las imágenes; se sirven tal cual.
- **Modo claro por defecto.** Aunque hay soporte de tema oscuro, el valor inicial es `light`.

## Código sin uso

Los siguientes archivos no se importan desde ninguna ruta ni componente. Se pueden eliminar tras confirmar que no se necesitan:

`components/auth/login-form.tsx`, `components/camera-view.tsx`, `components/enhanced-header.tsx`, `components/enhanced-header-v2.tsx`, `components/animated-header.tsx`, `components/existing-vehicle-alert.tsx`, `components/dashboard/recent-vehicles-grid.tsx`, `components/dashboard/activity-timeline.tsx`, `components/dashboard/real-activity-timeline.tsx`, `components/dashboard/last-captured-vehicle.tsx`, `components/dashboard/welcome-banner.tsx`, `components/dashboard/animated-stats-card.tsx`, `components/dashboard/vehicle-status-chart.tsx`.

Hay además duplicidades: `camera-view.tsx` y `enhanced-camera-interface.tsx` implementan la misma cámara, y `app/login/page.tsx` y `login-form.tsx` implementan el mismo login.
