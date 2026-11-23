# SAO6 – Flota Vehículos

Aplicación web para la **captura, almacenamiento y consulta de fotografías de vehículos de una flota**. Un operario registra un vehículo por su número, toma cuatro fotos (frontal, lateral izquierdo, posterior y lateral derecho) desde la cámara del dispositivo y las envía a un servidor. Desde el panel se consultan los vehículos y sus imágenes por carpeta.

> Documentación complementaria:
> - [`docs/arquitectura.md`](docs/arquitectura.md): estructura de código, flujos y almacenamiento en el navegador.
> - [`docs/api.md`](docs/api.md): endpoints del servidor de imágenes que consume la aplicación.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Flujo de uso](#flujo-de-uso)
- [Autenticación](#autenticación)
- [Configuración](#configuración)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Limitaciones conocidas](#limitaciones-conocidas)

---

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js 15.2.4 (App Router) |
| UI | React 19, TypeScript 5 |
| Estilos | Tailwind CSS 3.4, `tailwindcss-animate`, `class-variance-authority`, `tailwind-merge` |
| Componentes | Radix UI, componentes estilo shadcn/ui en `components/ui/` |
| Animación | framer-motion |
| Gráficos | recharts 2.15 |
| Formularios | react-hook-form, zod |
| Fechas | date-fns 4 |
| Notificaciones | sonner y un sistema propio de toasts |
| Temas | next-themes (claro por defecto, con soporte de sistema) |
| Cookies | js-cookie |

## Requisitos

- Node.js 18.18 o superior (mínimo exigido por Next.js 15; no se ha comprobado en este repositorio).
- npm. El repositorio contiene `package-lock.json`, que es el lockfile de referencia.
- Acceso de red al servidor de imágenes configurado en `lib/api-service.ts` (ver [Configuración](#configuración)).
- Un navegador con acceso a la cámara (`navigator.mediaDevices.getUserMedia`) para la captura. Requiere contexto seguro (HTTPS o `localhost`).

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Vehiculos-Flota

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Modo desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

> **Nota sobre `--legacy-peer-deps`:** `react-day-picker@8.10.1` declara peer dependencies de React anteriores a la 19, y el proyecto usa React 19. Con `npm ci` o `npm install` sin la opción aparece un error `ERESOLVE`. Con `--legacy-peer-deps` la instalación completa.

## Scripts disponibles

Definidos en `package.json`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo de Next.js (`next dev`) |
| `npm run build` | Compilación de producción (`next build`) |
| `npm run start` | Sirve la compilación de producción (`next start`); requiere haber ejecutado `build` |
| `npm run lint` | Ejecuta `next lint`. El repositorio no incluye una configuración de ESLint, así que la primera ejecución puede pedir crearla. |

Antes de desplegar, tenga en cuenta que `next.config.mjs` está configurado para **ignorar errores de TypeScript y de ESLint durante el build** (`typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds`). Un build correcto no garantiza que el código no tenga errores de tipos.

## Rutas de la aplicación

| Ruta | Archivo | Acceso | Descripción |
|---|---|---|---|
| `/` | `app/page.tsx` | Público | Redirige a `/dashboard` si hay sesión activa, o a `/login` si no la hay. |
| `/login` | `app/login/page.tsx` | Público | Formulario de acceso. Incluye "recordarme" (guarda solo el nombre de usuario). |
| `/dashboard` | `app/dashboard/page.tsx` | Protegido | Panel con resumen del último vehículo capturado y estado de la flota. |
| `/dashboard?view=gallery` | `app/dashboard/page.tsx` | Protegido | Galería de vehículos y de sus imágenes, organizada por carpetas. |
| `/captura` | `app/captura/page.tsx` | Protegido | Flujo de captura de las cuatro vistas de un vehículo. |
| `/captura?id=<n>` | `app/captura/page.tsx` | Protegido | Igual que `/captura`, con el vehículo ya indicado. |

Las rutas protegidas envuelven su contenido en `ProtectedRoute` (`components/auth/protected-route.tsx`), que redirige a `/login` cuando no hay sesión.

## Flujo de uso

### 1. Captura de un vehículo (`/captura`)

1. El operario introduce el **número de vehículo**. Se aceptan valores entre **1 y 261**; cualquier carácter que no sea dígito se elimina antes de validar.
2. Para cada una de las cuatro vistas, la cámara se activa, se toma la foto y se guarda como JPEG (calidad 0.95) en memoria.

   | ID de vista | Nombre |
   |---|---|
   | 1 | Frontal |
   | 2 | Izquierdo |
   | 3 | Posterior |
   | 4 | Derecho |

3. Cuando las cuatro fotos están capturadas se muestra el **resumen**, donde se pueden revisar o repetir fotos.
4. Al confirmar, `uploadAllPhotos` envía las vistas **de una en una**, con 500 ms de espera entre envíos. Si una falla, el proceso se detiene y se informa del error.

Si el número de vehículo ya tiene imágenes en el servidor, el componente `existing-vehicle-alert` lo advertiría, pero **ese componente no está importado en ninguna parte** (ver [Limitaciones conocidas](#limitaciones-conocidas)).

### 2. Consulta (`/dashboard`)

- `RealDataProvider` consulta las carpetas, los vehículos de cada carpeta y las imágenes del vehículo más reciente para el resumen.
- La galería (`?view=gallery`) lista carpetas, vehículos e imágenes. Permite búsqueda, vista ampliada, selección múltiple, descarga y compartir (enlaces a WhatsApp, Facebook y X/Twitter). Las búsquedas recientes se guardan en `localStorage`.

## Autenticación

La autenticación es **solo del lado del cliente**. No existe un endpoint de login ni un token de sesión verificado por el servidor.

- Las credenciales válidas están escritas directamente en el código de `app/login/page.tsx`. Se comparan en el navegador con el texto introducido.
- Al autenticarse, la aplicación guarda en `localStorage`:
  - `sao6_user`: nombre de usuario.
  - `sao6_auth_time`: marca de tiempo del acceso.
- La sesión dura **8 horas**. Pasado ese tiempo, `AuthProvider` borra ambas claves y el usuario debe volver a entrar.
- La casilla "recordarme" guarda `sao6_remembered_username` (solo el nombre de usuario, nunca la contraseña).

Esto impide el acceso casual a la interfaz, pero no protege los datos: quien tenga acceso a la URL puede modificar `localStorage` o leer el código fuente, y las peticiones al servidor de imágenes no van autenticadas desde esta aplicación. Ver [Limitaciones conocidas](#limitaciones-conocidas).

## Configuración

### Servidor de imágenes

La URL base está fijada en el código, en `lib/api-service.ts`:

```ts
const API_BASE_URL = "https://imagenesflota.sao6.com.co"
```

Para cambiar de servidor (por ejemplo, para un entorno de pruebas) hay que editar esta constante. No existe una variable de entorno para ello.

### Next.js (`next.config.mjs`)

- **Imágenes:** `images.unoptimized: true`. Los dominios permitidos son `imagenesflota.sao6.com.co`, `*.vercel.app` y `v0.dev`.
- **Proxy `/api/*`:** `rewrites` redirige `/api/:path*` a `https://imagenesflota.sao6.com.co/:path*`. Ningún archivo de la aplicación llama a `/api/...` en la ruta relativa, así que hoy no se usa; `lib/api-service.ts` usa la URL absoluta.
- **Configuración opcional:** el archivo intenta importar `v0-user-next.config.mjs` o `v0-user-next.config`. Si no existe, lo ignora.

### Variables de entorno

No se usan variables de entorno en el código. El `.gitignore` excluye `.env*`.

### Tema visual

El tema por defecto es claro (`app/layout.tsx`, `defaultTheme="light"`, con `enableSystem`). El tema de color del encabezado se guarda en `localStorage` con la clave `header-color-theme`.

### Avisos de versión

`components/version-notification.tsx` muestra avisos de las versiones `v1.0.0`, `v1.1.0` y `v1.2.0`. Al cerrarse, guarda una cookie `sao6_seen_<versión>` con una caducidad de 30 días. Para añadir un aviso, agregue una entrada al array `APP_VERSIONS` de ese archivo.

## Estructura del proyecto

```
Vehiculos-Flota/
├── app/                      # Rutas (App Router)
│   ├── layout.tsx            # Layout raíz: AuthProvider, ThemeProvider, Toaster
│   ├── page.tsx              # Redirección según sesión
│   ├── login/page.tsx        # Pantalla de acceso
│   ├── dashboard/            # Panel principal (page.tsx, loading.tsx)
│   ├── captura/              # Flujo de captura (page.tsx, layout.tsx, loading.tsx)
│   └── globals.css
├── components/
│   ├── auth/                 # AuthProvider, ProtectedRoute
│   ├── dashboard/            # Datos del panel (RealDataProvider, tarjetas, estado de flota)
│   ├── gallery/              # Galería y visor (gallery-view.tsx y components/)
│   ├── ui/                   # Componentes base estilo shadcn/ui
│   └── *.tsx                 # Cámara, resumen de fotos, encabezado, avisos, etc.
├── hooks/                    # use-auth, use-toast, use-notifications, use-mobile
├── lib/
│   ├── api-service.ts        # Cliente HTTP del servidor de imágenes
│   └── utils.ts              # Utilidades (cn)
├── styles/                   # Estilos adicionales (globals.css, camera-interface.css)
├── public/                   # Imágenes y placeholders
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── components.json           # Configuración de shadcn/ui
├── package.json
└── package-lock.json
```

Para el detalle de cada módulo y de los flujos de datos, véase [`docs/arquitectura.md`](docs/arquitectura.md).

## Limitaciones conocidas

Estas observaciones salen de la revisión del código. No se han corregido.

**Seguridad**

1. **Credenciales en el código.** El usuario y la contraseña de acceso están en `app/login/page.tsx`. Cualquiera que pueda leer el bundle del cliente puede verlos. `components/auth/login-form.tsx` contiene las mismas credenciales, aunque ese componente no se usa.
2. **Autenticación solo en cliente.** Un usuario puede escribir `sao6_user` y `sao6_auth_time` en `localStorage` y entrar al panel sin conocer la contraseña.
3. **Peticiones sin autenticación.** Las llamadas a `/upload/`, `/folders`, `/vehicles/...` e `/images/...` no envían credenciales. Si el servidor no las exige por su cuenta, cualquiera que conozca la URL puede subir o leer imágenes.
4. **Cabeceras sin efecto de seguridad.** `uploadPhoto` establece `Content-Security-Policy` y `Origin` en la petición de subida. `Origin` es una cabecera que el navegador gestiona por sí mismo, y `Content-Security-Policy` es una cabecera de respuesta: enviarla en la petición no protege nada, y además puede forzar una petición de preflight CORS.

**Build y dependencias**

5. **Errores de tipos y de lint ignorados en el build** (`next.config.mjs`).
6. **Conflicto de peer dependencies** entre `react-day-picker@8.10.1` y React 19. Requiere `--legacy-peer-deps`.
7. **Lockfiles duplicados.** Hay `package-lock.json` (con contenido real) y `pnpm-lock.yaml` (archivo de 92 bytes, sin paquetes). Conviene mantener solo uno.
8. **Versiones sin fijar.** `framer-motion`, `@radix-ui/react-toast`, `@radix-ui/react-progress` y `@emotion/is-prop-valid` usan `latest`.

**Código**

9. **Componentes sin uso.** Ningún archivo los importa: `login-form.tsx`, `camera-view.tsx`, `enhanced-header.tsx`, `enhanced-header-v2.tsx`, `animated-header.tsx`, `existing-vehicle-alert.tsx`, `recent-vehicles-grid.tsx`, `activity-timeline.tsx`, `real-activity-timeline.tsx`, `last-captured-vehicle.tsx`, `welcome-banner.tsx`, `animated-stats-card.tsx` y `vehicle-status-chart.tsx`. Hay además dos cámaras (`camera-view.tsx` y `enhanced-camera-interface.tsx`) y dos pantallas de login.
10. **Comentario desactualizado.** `lib/api-service.ts` menciona `https://192.168.90.33/api` en la cabecera, pero la constante usa `https://imagenesflota.sao6.com.co`.
11. **Lógica duplicada en el cliente API.** Las funciones de normalización de URL e imágenes de `lib/api-service.ts` tienen ramas redundantes (por ejemplo, `startsWith('https://')` se comprueba dos veces con el mismo valor).
12. **Tiempo de espera en subida.** La subida de cada foto tiene un límite de 15 segundos con `AbortController`. Con conexiones lentas, una foto grande puede fallar aunque el servidor la esté procesando.
