"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Titre de carte trop long pour tenir sur une ligne : défile tout seul jusqu'au bout puis revient,
// plutôt que de couper avec "..." derrière une icône (i) qu'il fallait survoler pour lire la
// suite — surtout gênant au tactile, où le survol n'existe pas. Ne s'anime que si ça déborde
// vraiment (mesuré à l'affichage), sinon le titre reste simplement affiché tel quel.
export function ScrollingTitle({ text, className, dir = "auto" }: { text: string; className?: string; dir?: "auto" | "ltr" | "rtl" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setOverflowPx(diff > 2 ? diff : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <div ref={containerRef} dir={dir} className={cn("min-w-0 overflow-hidden", className)}>
      <span
        ref={textRef}
        className={cn("inline-block whitespace-nowrap", overflowPx > 0 && "animate-marquee-title")}
        style={overflowPx > 0 ? ({ "--scroll-distance": `${overflowPx}px` } as React.CSSProperties) : undefined}
      >
        {text}
      </span>
    </div>
  );
}

