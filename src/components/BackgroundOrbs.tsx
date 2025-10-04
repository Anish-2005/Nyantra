"use client";
import React, { useEffect, useRef } from 'react';

type Orb = {
  left: string;
  top: string;
  size: number;
  colorA: string;
  colorB: string;
  duration: number;
  delay: number;
};

const ORBS: Orb[] = [
  // Fallbacks here are soft; actual colors will be derived from CSS variables when mounted
  { left: '10%', top: '10%', size: 420, colorA: 'rgba(251,113,133,0.16)', colorB: 'rgba(251,146,60,0.10)', duration: 18, delay: 0 },
  { left: '80%', top: '5%', size: 340, colorA: 'rgba(139,92,246,0.12)', colorB: 'rgba(139,92,246,0.06)', duration: 20, delay: 2 },
  { left: '60%', top: '70%', size: 480, colorA: 'rgba(8,145,178,0.10)', colorB: 'rgba(139,92,246,0.06)', duration: 22, delay: 1 },
  { left: '15%', top: '70%', size: 300, colorA: 'rgba(251,113,133,0.12)', colorB: 'rgba(251,146,60,0.06)', duration: 24, delay: 3 },
];

export default function BackgroundOrbs() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = containerRef.current!;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // skip on touch

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // normalized -0.5..0.5
      target.current.x = (e.clientX / w - 0.5) * 2;
      target.current.y = (e.clientY / h - 0.5) * 2;
    };

    function frame() {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.08);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.08);

      // Apply transform to each orb for parallax
      const orbs = el.querySelectorAll<HTMLElement>('[data-orb-index]');
      orbs.forEach((o) => {
        const idx = Number(o.dataset.orbIndex || 0);
        // scale translation by index to give depth
        const depth = (idx + 1) / orbs.length; // 0..1
        const tx = pos.current.x * 60 * depth;
        const ty = pos.current.y * 40 * depth;
        o.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      requestAnimationFrame(frame);
    }

    // Try to read accent colors from CSS vars to create harmonious orb gradients
    // helper to convert hex or rgb string to `r,g,b` numeric string
    const hexToRgb = (input: string) => {
      if (!input) return '255,255,255';
      const s = input.replace(/\s/g, '');
      // rgb(...) already
      const rgbMatch = s.match(/rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/i);
      if (rgbMatch) return `${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`;
      // hex #rrggbb
      const hex = s.replace('#', '');
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return `${r},${g},${b}`;
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `${r},${g},${b}`;
      }
      return '255,255,255';
    };

    try {
      const style = getComputedStyle(document.documentElement);
      const a = style.getPropertyValue('--accent-primary').trim() || '';
      const b = style.getPropertyValue('--accent-secondary').trim() || '';
      if (a && b) {
        // update ORBS colors in-place to use the theme accents (soft alpha)
        ORBS.forEach((orb) => {
          orb.colorA = `rgba(${hexToRgb(a)},0.14)`;
          orb.colorB = `rgba(${hexToRgb(b)},0.08)`;
        });
      }
  } catch {}

    window.addEventListener('pointermove', onMove);
    const id = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden style={{ position: 'relative', width: '100%', height: '100%' }}>
      {ORBS.map((orb, _i) => (
        <div
          key={_i}
          data-orb-index={_i}
          style={{
            position: 'absolute',
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orb.colorA} 0%, ${orb.colorB} 40%, rgba(15,23,42,0) 70%)`,
            filter: 'blur(64px)',
            opacity: 0.8,
            transform: 'translate3d(0,0,0)',
            transition: 'transform 0.15s linear',
            zIndex: 1,
            pointerEvents: 'none',
            animation: `float-${_i} ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float-0 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(20px, -10px, 0) } 100% { transform: translate3d(0,0,0) } }
        @keyframes float-1 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(-18px, 12px, 0) } 100% { transform: translate3d(0,0,0) } }
        @keyframes float-2 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(12px, 18px, 0) } 100% { transform: translate3d(0,0,0) } }
        @keyframes float-3 { 0% { transform: translate3d(0,0,0) } 50% { transform: translate3d(-10px, -18px, 0) } 100% { transform: translate3d(0,0,0) } }
      `}</style>
    </div>
  );
}
