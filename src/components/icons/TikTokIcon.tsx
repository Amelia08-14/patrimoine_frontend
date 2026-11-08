import type { SVGProps } from "react"

/**
 * Icône TikTok — lucide-react n'en fournit pas. Même style que les icônes lucide (trait de 2 px,
 * `currentColor`, viewBox 24) pour s'aligner avec Facebook / Instagram / LinkedIn / YouTube.
 */
export function TikTokIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}
