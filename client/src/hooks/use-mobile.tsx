// src/hooks/use-mobile.tsx
import { useEffect, useState } from "react";

/** Generic media query hook */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Safari <14 fallback
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else (mql as any).addListener(handler);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else (mql as any).removeListener(handler);
    };
  }, [query]);

  return matches;
}

/** Convenience: true on mobile screens */
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}
