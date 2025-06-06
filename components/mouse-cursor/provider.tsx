"use client"

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageFocus } from "@/hooks/use-page-focus";

interface MouseCursorProps {
  imageSrc?: string;
  staticImageSrc?: string;
  imageAlt?: string;
  size?: number;
  trailCount?: number;
  showMagnetic?: boolean;
}

export const MouseCursorProvider = ({
  imageSrc = "/images/alyakuru.png",
  staticImageSrc,
  imageAlt = "Custom cursor",
  size = 40,
  trailCount = 8,
  showMagnetic = true
}: MouseCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const magneticRef = useRef<HTMLDivElement>(null);
  const mouseVelocity = useRef({ x: 0, y: 0 });
  const animationEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnimationFrame = useRef<number | null>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());

  const [currentCursorImage, setCurrentCursorImage] = useState(staticImageSrc || imageSrc);
  const isMobile = useIsMobile();
  const isPageFocused = usePageFocus();

  const throttledMouseMove = useCallback((e: MouseEvent) => {
    if (lastAnimationFrame.current) {
      cancelAnimationFrame(lastAnimationFrame.current);
    }

    lastAnimationFrame.current = requestAnimationFrame(() => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      // Only update if enough time has passed (throttling)
      if (deltaTime < 16) return; // ~60fps

      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;

      // Only update velocity if mouse actually moved
      if (deltaX !== 0 || deltaY !== 0) {
        mouseVelocity.current = {
          x: deltaX / deltaTime,
          y: deltaY / deltaTime
        };
      }

      // Update image state only when needed
      if (currentCursorImage !== imageSrc) {
        if (animationEndTimeoutRef.current) {
          clearTimeout(animationEndTimeoutRef.current);
        }
        setCurrentCursorImage(imageSrc);

        if (staticImageSrc) {
          animationEndTimeoutRef.current = setTimeout(() => {
            setCurrentCursorImage(staticImageSrc);
          }, 300);
        }
      }

      // Memoize expensive calculations
      const speed = Math.abs(mouseVelocity.current.x) + Math.abs(mouseVelocity.current.y);
      const rotation = speed > 0.1 ? Math.atan2(mouseVelocity.current.y, mouseVelocity.current.x) * (180 / Math.PI) : 0;
      const scale = speed > 0.5 ? 1.2 : 1;

      // Batch GSAP animations
      const tl = gsap.timeline();

      // Animate cursor
      if (cursorRef.current) {
        tl.to(cursorRef.current, {
          x: e.clientX - size / 2,
          y: e.clientY - size / 2,
          rotation: rotation,
          scale: scale,
          duration: 0.1,
          ease: "power2.out"
        }, 0);
      }

      // Animate magnetic effect
      if (magneticRef.current && showMagnetic) {
        tl.to(magneticRef.current, {
          x: e.clientX - 64,
          y: e.clientY - 64,
          duration: 0.2,
          ease: "power2.out"
        }, 0);
      }

      // Optimize trail animation with batch updates
      trailRefs.current.forEach((trailEl, index) => {
        if (trailEl) {
          tl.to(trailEl, {
            x: e.clientX - 4,
            y: e.clientY - 4,
            scale: (index + 1) / trailCount,
            opacity: (index + 1) / trailCount * 0.8,
            duration: 0.3 + index * 0.05,
            ease: "power2.out"
          }, 0);
        }
      });

      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      lastUpdateTime.current = currentTime;
    });
  }, [imageSrc, staticImageSrc, size, trailCount, showMagnetic, currentCursorImage]);

  useEffect(() => {
    setCurrentCursorImage(staticImageSrc || imageSrc);
  }, [imageSrc, staticImageSrc]);

  useEffect(() => {
    // Set initial state for the magnetic ring
    if (magneticRef.current && showMagnetic) {
      gsap.set(magneticRef.current, { scale: 0.5, opacity: 0.1 });
    }

    const handleMouseMove = (e: MouseEvent) => {
      throttledMouseMove(e);
    };

    const handleMouseLeave = () => {
      // Cancel any pending animation frames
      if (lastAnimationFrame.current) {
        cancelAnimationFrame(lastAnimationFrame.current);
      }

      // Batch fade out animations
      const tl = gsap.timeline();

      trailRefs.current.forEach((trailEl) => {
        if (trailEl) {
          tl.to(trailEl, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
          }, 0);
        }
      });

      if (magneticRef.current && showMagnetic) {
        tl.to(magneticRef.current, {
          scale: 0.5,
          opacity: 0.1,
          duration: 0.1,
          ease: "power2.out"
        }, 0);
      }

      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current);
        animationEndTimeoutRef.current = null;
      }
      if (staticImageSrc) {
        setCurrentCursorImage(staticImageSrc);
      }
    };

    const handleMouseDown = () => {
      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current);
        animationEndTimeoutRef.current = null;
      }
      setCurrentCursorImage(imageSrc);

      if (magneticRef.current && showMagnetic) {
        gsap.to(magneticRef.current, {
          scale: 1,
          opacity: 0.3,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    };

    const handleMouseUp = () => {
      if (staticImageSrc) {
        setCurrentCursorImage(staticImageSrc);
      }

      if (magneticRef.current && showMagnetic) {
        gsap.to(magneticRef.current, {
          scale: 0.5,
          opacity: 0.1,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      // Cleanup animation frames and timeouts
      if (lastAnimationFrame.current) {
        cancelAnimationFrame(lastAnimationFrame.current);
      }
      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current);
      }
    };
  }, [size, trailCount, showMagnetic, throttledMouseMove]);

  // Return null for mobile devices or when page is not focused
  if (isMobile || !isPageFocused) {
    return null;
  }

  return (
    <>
      {/* Custom cursor */}
      <div ref={cursorRef} className="fixed pointer-events-none z-10000">
        <div className="relative" style={{ width: size, height: size }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-md animate-pulse"></div>
          <Image
            src={currentCursorImage}
            alt={imageAlt}
            width={size}
            height={size}
            className="relative z-10 drop-shadow-lg"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Magical sparkle trail */}
      {Array.from({ length: trailCount }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) trailRefs.current[index] = el;
          }}
          className="fixed pointer-events-none z-40 opacity-0"
        >
          <div className="w-2 h-2 text-yellow-400">
            ✨
          </div>
        </div>
      ))}

      {/* Magnetic effect */}
      {showMagnetic && (
        <div
          ref={magneticRef}
          className="fixed w-32 h-32 pointer-events-none z-30 rounded-full border-2 border-purple-400/30 mix-blend-multiply dark:mix-blend-screen"
        />
      )}
    </>
  );
};