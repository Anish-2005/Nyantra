"use client";
import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type * as THREE from 'three';

interface ParticlesCanvasProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ParticlesCanvas: React.FC<ParticlesCanvasProps> = ({
  id,
  className = "fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500",
  style = { zIndex: 0, background: 'transparent' }
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const isMobile = window.innerWidth < 768;
      const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
        antialias: !isMobile
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      camera.position.z = 5;
      renderer.setClearColor(0x000000, 0);

      // Theme-aware colors
      let particleColor: THREE.Color | number = theme === 'dark' ? 0x3b82f6 : 0x1e40af;
      let lineColor: THREE.Color | number = theme === 'dark' ? 0xf59e0b : 0xd97706;
      try {
        const style = getComputedStyle(document.documentElement);
        const a = (style.getPropertyValue('--accent-primary') || '').trim();
        const b = (style.getPropertyValue('--accent-secondary') || '').trim();
        if (a) particleColor = new THREE.Color(a);
        if (b) lineColor = new THREE.Color(b);
      } catch { }

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = isMobile ? 350 : 1000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: theme === 'dark' ? 0.012 : 0.008,
        color: particleColor,
        transparent: true,
        opacity: theme === 'dark' ? 0.6 : 0.4,
        blending: THREE.AdditiveBlending
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Create connecting lines
      const linesGeometry = new THREE.BufferGeometry();
      const linesMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: theme === 'dark' ? 0.15 : 0.1
      });

      const linesPositions: number[] = [];
      const lineCount = isMobile ? 30 : 80;
      for (let i = 0; i < lineCount; i++) {
        const x1 = (Math.random() - 0.5) * 8;
        const y1 = (Math.random() - 0.5) * 8;
        const z1 = (Math.random() - 0.5) * 8;
        const x2 = x1 + (Math.random() - 0.5) * 1.5;
        const y2 = y1 + (Math.random() - 0.5) * 1.5;
        const z2 = z1 + (Math.random() - 0.5) * 1.5;
        linesPositions.push(x1, y1, z1, x2, y2, z2);
      }

      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linesPositions, 3));
      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      // Render one frame even when animation is off (reduced motion)
      const step = () => {
        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0001;
        linesMesh.rotation.y -= 0.0002;
      };

      let animationId: number | null = null;
      const renderFrame = () => {
        try {
          renderer.render(scene, camera);
        } catch {
          // suppress WebGL uniform/program-related errors which can occur on context loss
        }
      };
      const animate = () => {
        if (cancelled || document.hidden) {
          animationId = null;
          return;
        }
        animationId = requestAnimationFrame(animate);
        step();
        renderFrame();
      };

      if (prefersReducedMotion) {
        renderFrame(); // static field, no loop
      } else {
        animate();
      }

      // Resume the loop when the tab becomes visible again
      const handleVisibility = () => {
        if (prefersReducedMotion || cancelled) return;
        if (!document.hidden && animationId === null) animate();
      };

      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      const handleResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderFrame();
        }, 150);
      };

      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        cancelled = true;
        if (animationId !== null) cancelAnimationFrame(animationId);
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={style}
    />
  );
};
