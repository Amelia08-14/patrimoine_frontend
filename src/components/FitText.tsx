"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Texte « dynamique » pour les colonnes étroites (formulaires en 3 colonnes sur mobile — retour client
 * du 08/11/2026) : sous `md` le texte reste sur UNE ligne et, s'il dépasse vraiment sa colonne (mesuré,
 * ResizeObserver), il défile jusqu'au bout puis revient — même animation que `ScrollingTitle`
 * (`animate-marquee-title`). Dès `md` il reprend un retour à la ligne normal (aucun débordement, donc
 * aucune animation). Accepte du JSX (ex. libellé + astérisque « obligatoire »).
 */
export function FitText({ children, className }: { children: React.ReactNode; className?: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const measure = () => {
      const diff = inner.scrollWidth - box.clientWidth;
      if (diff <= 2) { setDistance(0); return; }
      // En arabe le texte déborde à gauche : on défile vers la droite.
      const rtl = getComputedStyle(box).direction === "rtl";
      setDistance(rtl ? -diff : diff);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <span ref={boxRef} className={cn("block min-w-0 overflow-hidden", className)}>
      <span
        ref={innerRef}
        className={cn("inline-block whitespace-nowrap md:whitespace-normal", distance !== 0 && "animate-marquee-title")}
        style={distance !== 0 ? ({ "--scroll-distance": `${distance}px` } as React.CSSProperties) : undefined}
      >
        {children}
      </span>
    </span>
  );
}
