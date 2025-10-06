"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import type * as THREE from 'three';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Shield, 
  UserCheck,
  Rocket,
  ArrowRight
} from 'lucide-react';

// Helper to safely extract message from unknown error
function messageFromUnknown(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const maybe = (err as Record<string, unknown>).message;
    return typeof maybe === 'string' ? maybe : null;
  }
  return null;
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (isRegister) await signUp(email, password);
      else await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(messageFromUnknown(err) || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(messageFromUnknown(err) || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to dashboard when user is authenticated (do this in effect to avoid updates during render)
  useEffect(() => {
    if (!loading && user) {
      // client-side navigation
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Three.js Background Effect (same as dashboard)
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
        antialias: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      const particlesCount = window.innerWidth < 768 ? 300 : 600;
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
      const lineCount = window.innerWidth < 768 ? 30 : 60;
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

      let animationId: number | null = null;
      const animate = () => {
        if (cancelled) return;
        animationId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0001;
        linesMesh.rotation.y -= 0.0002;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelled = true;
        window.removeEventListener('resize', handleResize);
        if (animationId !== null) cancelAnimationFrame(animationId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
      };
    })();
  }, [theme]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div data-theme={theme} className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ background: 'var(--bg-gradient)' }}>
      {/* Theme Variables */}
      <style jsx global>{`
        [data-theme="dark"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(30, 64, 175, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          --card-bg: rgba(15, 23, 42, 0.7);
          --card-border: rgba(255, 255, 255, 0.08);
          --nav-bg: rgba(15, 23, 42, 0.95);
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --accent-primary: #06b6d4;
          --accent-secondary: #8b5cf6;
          --glass-bg: rgba(15, 23, 42, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        [data-theme="light"] {
          --bg-gradient: radial-gradient(1200px 600px at 10% 10%, rgba(59, 130, 246, 0.08), transparent 8%), 
                         radial-gradient(900px 500px at 90% 90%, rgba(245, 158, 11, 0.06), transparent 8%), 
                         linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
          --card-bg: rgba(255, 255, 255, 0.8);
          --card-border: rgba(0, 0, 0, 0.06);
          --nav-bg: rgba(255, 255, 255, 0.95);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --accent-primary: #fb7185;
          --accent-secondary: #fb923c;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(0, 0, 0, 0.08);
        }

        .theme-text-primary { color: var(--text-primary) !important; }
        .theme-text-secondary { color: var(--text-secondary) !important; }
        .theme-text-muted { color: var(--text-muted) !important; }
        .theme-bg-card { background: var(--card-bg) !important; }
        .theme-border-card { border-color: var(--card-border) !important; }
        .theme-bg-glass { background: var(--glass-bg) !important; }
        .theme-border-glass { border-color: var(--glass-border) !important; }
        .theme-bg-nav { background: var(--nav-bg) !important; }
        
        .accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        }
        
        .text-accent-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 0, background: 'transparent' }}
      />

      {/* Enhanced Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl accent-gradient ${theme === 'dark' ? 'opacity-15' : 'opacity-20'}`}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Theme Toggle */}
          <motion.button
            variants={itemVariants}
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary backdrop-blur-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Login Card */}
          <motion.div
            variants={itemVariants}
            className="theme-bg-card theme-border-card border rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute inset-0 accent-gradient opacity-5 pointer-events-none z-0 rounded-xl" aria-hidden />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-xl overflow-hidden bg-transparent"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Image 
                    src={theme === 'dark' ? '/Logo-Dark.png' : '/Logo-Light.png'} 
                    alt="Nyantra" 
                    width={48} 
                    height={48} 
                    className="object-contain"
                  />
                </motion.div>
                <div>
                  <motion.h2 
                    className="text-xl font-bold theme-text-primary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {isRegister ? 'Create your account' : 'Welcome back'}
                  </motion.h2>
                  <motion.p 
                    className="text-sm theme-text-muted"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isRegister ? 'Sign up to access the dashboard' : 'Sign in to continue to your dashboard'}
                  </motion.p>
                </div>
              </div>

              {/* Status Badge */}
              <motion.div
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border theme-border-glass theme-bg-glass theme-text-secondary mb-6"
                animate={{
                  boxShadow: theme === 'dark'
                    ? ['0 0 0 0 rgba(59, 130, 246, 0.4)', '0 0 0 8px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                    : ['0 0 0 0 rgba(30, 64, 175, 0.4)', '0 0 0 8px rgba(30, 64, 175, 0)', '0 0 0 0 rgba(30, 64, 175, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="inline w-3 h-3 mr-2 text-accent-gradient" />
                Smart DBT Platform
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-accent-primary transition-all"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 pr-10 rounded-lg theme-bg-glass theme-border-glass border theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-accent-primary transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl accent-gradient text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  variants={itemVariants}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRegister ? (
                        <>
                          <UserCheck className="w-5 h-5" />
                          Create account
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          Sign in
                        </>
                      )}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Google Sign-in */}
              <div className="mt-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg border theme-border-glass theme-bg-glass flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-50"
                >
                  <span aria-hidden className="w-5 h-5 inline-block">
                    <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                      <path d="M533.5 278.4c0-18.5-1.6-36.2-4.7-53.4H272v101.1h147.4c-6.3 34.2-25.8 63.2-55 82.6v68.5h88.8c52-48 81.3-118.6 81.3-198.8z" fill="#4285F4"/>
                      <path d="M272 544.3c73.7 0 135.6-24.6 180.8-66.8l-88.8-68.5c-24.7 16.6-56.4 26.4-92 26.4-70.7 0-130.6-47.8-152-112.1H29.7v70.4C74.5 485.9 168 544.3 272 544.3z" fill="#34A853"/>
                      <path d="M120 325.3c-10.6-31.4-10.6-65.2 0-96.6V158.3H29.7c-40.3 80.6-40.3 174.5 0 255.1L120 325.3z" fill="#FBBC05"/>
                      <path d="M272 107.7c38.9 0 73.9 13.4 101.5 39.6l76-76C407.6 24 345.7 0 272 0 168 0 74.5 58.4 29.7 158.3l90.3 70.4C141.4 155.5 201.3 107.7 272 107.7z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <span className="theme-text-primary">Continue with Google</span>
                </button>
              </div>

              {/* Footer Links */}
              <motion.div 
                className="mt-6 flex items-center justify-between text-sm"
                variants={itemVariants}
              >
                <button 
                    onClick={() => setIsRegister(!isRegister)} 
                    className="text-accent-gradient font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  disabled={isLoading}
                >
                    {isRegister ? 'Have an account? Sign in' : 'Don\'t have an account? Sign up'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!isRegister && (
                  <a href="#" className="theme-text-muted hover:text-accent-gradient transition-colors">
                    Forgot password?
                  </a>
                )}
              </motion.div>

              {/* Security Note */}
              <motion.p 
                className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Shield className="w-3 h-3" />
                Your data is securely encrypted and protected
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}