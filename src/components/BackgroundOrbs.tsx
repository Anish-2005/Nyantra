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
  { left: '10%', top: '10%', size: 420, colorA: 'rgba(59,130,246,0.18)', colorB: 'rgba(99,102,241,0.12)', duration: 18, delay: 0 },
  { left: '80%', top: '5%', size: 340, colorA: 'rgba(245,158,11,0.16)', colorB: 'rgba(245,158,11,0.08)', duration: 20, delay: 2 },
  { left: '60%', top: '70%', size: 480, colorA: 'rgba(139,92,246,0.12)', colorB: 'rgba(236,72,153,0.08)', duration: 22, delay: 1 },
  { left: '15%', top: '70%', size: 300, colorA: 'rgba(6,182,212,0.10)', colorB: 'rgba(59,130,246,0.06)', duration: 24, delay: 3 },
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

    window.addEventListener('pointermove', onMove);
    const id = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden style={{ position: 'relative', width: '100%', height: '100%' }}>
      {ORBS.map((orb, i) => (
        <div
          key={i}
          data-orb-index={i}
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
            animation: `float-${i} ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
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
