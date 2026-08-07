import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const scrollToHash = () => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -130;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      };

      // Try immediately and after a short delay to account for route mounting
      scrollToHash();
      const timer = setTimeout(scrollToHash, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, hash]);

  return null;
}

