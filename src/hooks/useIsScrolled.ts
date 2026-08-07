import { useState, useEffect } from "react";

/**
 * Custom hook to detect when the window has been scrolled past a certain threshold.
 * Uses requestAnimationFrame to throttle performance and prevent jank.
 * 
 * @param threshold The scroll y-offset in pixels to trigger scrolled state (default: 80)
 */
export function useIsScrolled(threshold = 80) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check on mount in case the page is loaded/refreshed already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}
