import { useState, useEffect } from "react";

export function useResponsivePanelDirection() {
  const getDirection = () =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? "vertical"
      : "horizontal";

  const [panelDirection, setPanelDirection] = useState<"horizontal" | "vertical">(getDirection);

  useEffect(() => {
    function handleResize() {
      setPanelDirection(getDirection());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return panelDirection;
}
