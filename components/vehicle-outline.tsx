interface VehicleOutlineProps {
  view: number
}

export default function VehicleOutline({ view }: VehicleOutlineProps) {
  // Renderizar diferentes vistas del vehículo según la vista seleccionada
  switch (view) {
    case 1: // Vista frontal
      return (
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 120 H150 M60 120 L60 50 C60 30 80 30 100 30 C120 30 140 30 140 50 L140 120"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line x1="70" y1="120" x2="130" y2="120" stroke="white" strokeWidth="4" opacity="0.5" />
          <rect x="70" y="40" width="60" height="20" rx="5" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="100" y1="40" x2="100" y2="60" stroke="white" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    case 2: // Vista lateral izquierda
      return (
        <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 80 H220 M20 80 L40 40 L180 40 L220 80" stroke="white" strokeWidth="2" opacity="0.5" />
          <circle cx="60" cy="80" r="15" stroke="white" strokeWidth="2" opacity="0.5" />
          <circle cx="180" cy="80" r="15" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="70" y1="55" x2="170" y2="55" stroke="white" strokeWidth="2" opacity="0.5" />
          <rect x="80" y="55" width="80" height="15" stroke="white" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    case 3: // Vista posterior
      return (
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 120 H150 M60 120 L60 50 C60 30 80 30 100 30 C120 30 140 30 140 50 L140 120"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line x1="70" y1="120" x2="130" y2="120" stroke="white" strokeWidth="4" opacity="0.5" />
          <rect x="70" y="50" width="60" height="30" rx="2" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="85" y1="50" x2="85" y2="80" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="115" y1="50" x2="115" y2="80" stroke="white" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    case 4: // Vista lateral derecha
      return (
        <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 80 H220 M20 80 L60 40 L200 40 L220 80" stroke="white" strokeWidth="2" opacity="0.5" />
          <circle cx="60" cy="80" r="15" stroke="white" strokeWidth="2" opacity="0.5" />
          <circle cx="180" cy="80" r="15" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="70" y1="55" x2="170" y2="55" stroke="white" strokeWidth="2" opacity="0.5" />
          <rect x="80" y="55" width="80" height="15" stroke="white" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    default:
      return null
  }
}

