import type { SVGProps } from "react"

/**
 * Petits drapeaux en SVG (France, Algérie, Royaume-Uni) pour marquer la langue d'un champ.
 * Les emojis drapeaux ne s'affichent pas sous Windows (ils apparaissent comme deux lettres), d'où le SVG.
 */
type FlagProps = SVGProps<SVGSVGElement>

const base = { viewBox: "0 0 30 20", width: 24, height: 16, role: "img" as const }

export function FlagFR(props: FlagProps) {
  return (
    <svg {...base} aria-label="Français" {...props}>
      <clipPath id="flagFrClip"><rect width="30" height="20" rx="3" /></clipPath>
      <g clipPath="url(#flagFrClip)">
        <rect width="10" height="20" fill="#0055A4" />
        <rect x="10" width="10" height="20" fill="#FFFFFF" />
        <rect x="20" width="10" height="20" fill="#EF4135" />
      </g>
      <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,0.15)" />
    </svg>
  )
}

export function FlagDZ(props: FlagProps) {
  return (
    <svg {...base} aria-label="الجزائر" {...props}>
      <clipPath id="flagDzClip"><rect width="30" height="20" rx="3" /></clipPath>
      <g clipPath="url(#flagDzClip)">
        <rect width="15" height="20" fill="#006233" />
        <rect x="15" width="15" height="20" fill="#FFFFFF" />
        {/* croissant : disque rouge percé d'un disque blanc décalé */}
        <circle cx="15" cy="10" r="5.2" fill="#D21034" />
        <circle cx="16.3" cy="10" r="4.2" fill="#FFFFFF" />
        {/* étoile */}
        <path d="M17.4 10l3.4-1.1-2.1 2.9v-3.6l2.1 2.9z" fill="#D21034" />
      </g>
      <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,0.15)" />
    </svg>
  )
}

export function FlagGB(props: FlagProps) {
  return (
    <svg {...base} aria-label="English" {...props}>
      <clipPath id="flagGbClip"><rect width="30" height="20" rx="3" /></clipPath>
      <g clipPath="url(#flagGbClip)">
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
      </g>
      <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,0.15)" />
    </svg>
  )
}
