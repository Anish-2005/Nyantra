"use client";
import React, { useEffect, useRef } from 'react';

export default function BackgroundCursor() {
  const haloRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: -1000, y: -1000 });
  const pos = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const halo = haloRef.current!;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (halo.style.opacity === '' || halo.style.opacity === '0') halo.style.opacity = '0.28';
    };

    function loop() {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.12);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.12);
      halo.style.transform = `translate3d(${pos.current.x - 160}px, ${pos.current.y - 160}px, 0)`;
      raf.current = requestAnimationFrame(loop);
    }

    window.addEventListener('pointermove', onMove);
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div
      ref={haloRef}
      aria-hidden
      className="pointer-events-none fixed rounded-full transform transition-transform duration-300 ease-out"
      style={{
        width: 320,
        height: 320,
        left: 0,
        top: 0,
        zIndex: 1,
        opacity: 0,
        filter: 'blur(48px)',
        // Use CSS accent vars for theme harmony (falls back to soft defaults)
        background: `radial-gradient(circle at 30% 30%, var(--accent-primary, rgba(59,130,246,0.14)) 0%, var(--accent-secondary, rgba(245,158,11,0.12)) 30%, rgba(15,23,42,0) 60%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
}
