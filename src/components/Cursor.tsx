"use client";
import React, { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const visible = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // Don't run on touch devices
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const onPointerMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        dot.style.opacity = '1';
        ring.style.opacity = '0.9';
      }
    };

    const onEnter = () => {
      dot.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;
      ring.style.transform = `translate3d(${target.current.x - 8}px, ${target.current.y - 8}px, 0)`;
    };

    const onPointerDown = () => {
      dot.classList.add('cursor-down');
      ring.classList.add('cursor-down');
    };
    const onPointerUp = () => {
      dot.classList.remove('cursor-down');
      ring.classList.remove('cursor-down');
    };

    // Expand when hovering interactive elements
    const isInteractive = (el: Element | null) => {
      if (!el || !(el instanceof Element)) return false;
      return !!(el.closest('a, button, input, textarea, select, [role="button"], [data-cursor-hover]'));
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (isInteractive(target)) {
        ring.classList.add('cursor-hover');
        dot.classList.add('cursor-hover');
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (isInteractive(target)) {
        ring.classList.remove('cursor-hover');
        dot.classList.remove('cursor-hover');
      }
    };

    function loop() {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.18);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.18);
      if (dot) dot.style.transform = `translate3d(${pos.current.x - 4}px, ${pos.current.y - 4}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${pos.current.x - 18}px, ${pos.current.y - 18}px, 0)`;
      raf.current = requestAnimationFrame(loop);
    }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointerenter', onEnter);
  window.addEventListener('pointerover', onPointerOver);
  window.addEventListener('pointerout', onPointerOut);

    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerout', onPointerOut);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed z-[9999] w-9 h-9 rounded-full transform transition-transform duration-150 ease-out opacity-0"
        style={{
          border: '2px solid rgba(245,158,11,0.9)',
          boxShadow: '0 6px 24px rgba(245,158,11,0.14)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed z-[10000] w-2 h-2 rounded-full transform transition-transform duration-150 ease-out opacity-0"
        style={{
          background: 'linear-gradient(180deg,#fff,#ffd28a)',
          boxShadow: '0 6px 14px rgba(245,158,11,0.5)',
        }}
      />
      <style jsx>{`
        .cursor-down { transform: scale(0.85) !important; opacity: 0.9 !important; }
        .cursor-hover { transform: scale(1.45) !important; }
      `}</style>
    </>
  );
}
