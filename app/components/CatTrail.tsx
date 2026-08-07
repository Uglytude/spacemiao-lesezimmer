"use client";

import { useEffect, useRef } from "react";

// Cat paw SVG as data URI
const PAW_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <ellipse cx="16" cy="20" rx="7" ry="8" fill="#2C3244" opacity="0.12"/>
  <ellipse cx="9" cy="11" rx="3.5" ry="4" fill="#2C3244" opacity="0.12"/>
  <ellipse cx="23" cy="11" rx="3.5" ry="4" fill="#2C3244" opacity="0.12"/>
  <ellipse cx="6" cy="18" rx="2.5" ry="3.5" fill="#2C3244" opacity="0.12"/>
  <ellipse cx="26" cy="18" rx="2.5" ry="3.5" fill="#2C3244" opacity="0.12"/>
</svg>`)}`;

interface Paw {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

let pawId = 0;

export default function CatTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const pawsRef = useRef<Paw[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const MIN_DISTANCE = 60; // pixels between paws
    let side = 1; // alternate left/right

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MIN_DISTANCE) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      // Offset paws slightly left/right of cursor path
      const perpX = Math.cos((angle - 90) * Math.PI / 180) * 8 * side;
      const perpY = Math.sin((angle - 90) * Math.PI / 180) * 8 * side;
      side *= -1;

      const paw: Paw = {
        id: pawId++,
        x: e.clientX + perpX,
        y: e.clientY + perpY,
        rotation: angle + (side > 0 ? -15 : 15),
        scale: 0.6 + Math.random() * 0.3,
      };

      pawsRef.current.push(paw);
      lastPos.current = { x: e.clientX, y: e.clientY };

      // Create DOM element
      if (containerRef.current) {
        const el = document.createElement("img");
        el.src = PAW_SVG;
        el.style.cssText = `
          position: fixed;
          left: ${paw.x - 16}px;
          top: ${paw.y - 16}px;
          width: 32px;
          height: 32px;
          transform: rotate(${paw.rotation}deg) scale(${paw.scale});
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease-in;
          z-index: 9999;
        `;
        containerRef.current.appendChild(el);

        // Fade in
        requestAnimationFrame(() => {
          el.style.opacity = "0.5";
        });

        // Fade out and remove
        setTimeout(() => {
          el.style.transition = "opacity 0.8s ease-out";
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 800);
        }, 600);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    />
  );
}
