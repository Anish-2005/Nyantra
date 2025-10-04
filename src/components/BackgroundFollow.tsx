"use client";
import React, { useEffect, useRef } from 'react';

export default function BackgroundFollow() {
  const starsContainer = useRef<HTMLDivElement | null>(null);
  const lastSpawn = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current > 60) {
        lastSpawn.current = now;
        spawnStar(e.clientX, e.clientY);
      }
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // spawn star into starsContainer
  function spawnStar(x: number, y: number) {
    const container = starsContainer.current;
    if (!container) return;

    const star = document.createElement('div');
    const size = 6 + Math.random() * 8;
    star.style.position = 'absolute';
    star.style.left = `${x - size / 2}px`;
    star.style.top = `${y - size / 2}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.borderRadius = '50%';
    star.style.background = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(245,245,220,0.9) 30%, rgba(245,158,11,0.8) 60%, rgba(245,158,11,0) 100%)';
    star.style.pointerEvents = 'none';
    star.style.transform = 'scale(0.2)';
    star.style.opacity = '0.95';
    star.style.filter = 'blur(0.8px)';
    star.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 520ms linear';

    container.appendChild(star);

    // animate out
    requestAnimationFrame(() => {
      const tx = (Math.random() - 0.5) * 40;
      const ty = -10 - Math.random() * 30;
      star.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1)`;
      star.style.opacity = '0';
    });

    // cleanup
    setTimeout(() => {
      try { container.removeChild(star); } catch (e) { /* ignore */ }
    }, 700);
  }

  return (
    <div ref={starsContainer} aria-hidden style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2 }} />
  );
}
