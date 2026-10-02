import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets the window scroll position on every route change so a new page always
// renders from the top, including lazy loaded routes and browser back/forward.
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
};