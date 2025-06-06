import { useEffect, useState } from "react";

export function usePageFocus() {
  const [isPageFocused, setIsPageFocused] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageFocused(!document.hidden);
    };

    const handleFocus = () => {
      setIsPageFocused(true);
    };

    const handleBlur = () => {
      setIsPageFocused(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isPageFocused;
}
