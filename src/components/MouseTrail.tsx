"use client";
import React, { useRef, useEffect } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
};

const COLORS = [200, 45, 280, 40]; // hues: blue, amber-ish, purple, yellow

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -1000, y: -1000, down: false });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(DPR, DPR);

    let lastTime = performance.now();

    function spawn(x: number, y: number) {
      const count = 4 + Math.round(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.6;
        const hue = COLORS[Math.floor(Math.random() * COLORS.length)];
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.6 + Math.random() * 0.9,
          size: 2 + Math.random() * 4,
          hue,
        });
      }
    }

    function update(dt: number) {
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= dt;
        p.size *= 0.995;
        if (p.life <= 0 || p.size < 0.3) particles.splice(i, 1);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        const alpha = Math.max(0, Math.min(1, p.life / 1.2));
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        gradient.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(${p.hue}, 80%, 50%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 40%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      // spawn following pointer (smooth)
      if (pointerRef.current.x > -900) {
        // spawn a few particles along movement
        const should = Math.random() < 0.55;
        if (should) spawn(pointerRef.current.x + (Math.random() - 0.5) * 8, pointerRef.current.y + (Math.random() - 0.5) * 8);
      }
      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;
      if (e instanceof TouchEvent) {
        const t = e.touches[0] || e.changedTouches[0];
        x = t.clientX;
        y = t.clientY;
      } else {
        const ev = e as MouseEvent;
        x = ev.clientX;
        y = ev.clientY;
      }
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const DPR2 = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * DPR2);
      canvas.height = Math.round(height * DPR2);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(DPR2, 0, 0, DPR2, 0, 0);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-70 mix-blend-screen"
      style={{ zIndex: 5 }}
    />
  );
}
