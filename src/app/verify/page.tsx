"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Sun, 
  Moon, 
  Shield,
  Rocket,
  ArrowRight,
  FileCheck,
  Lock,
  UserCheck
} from 'lucide-react';

export default function VerifyPage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) return; // wait until auth/profile loading finishes
    if (!user) {
      router.push('/login');
      return;
    }

    if (profile === undefined) return; // still loading profile

    if (profile === null) {
      router.push('/choose-role');
      return;
    }

    if (profile?.role === 'officer') {
      router.push('/dashboard');
      return;
    }

    if (profile?.role === 'user' && profile?.verified) {
      router.push('/user-dashboard');
      return;
    }
  }, [user, profile, loading, router]);

  const startMockVerification = async () => {
    setVerifying(true);
    
    // Simulate verification progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // simulate Digilocker flow
    await new Promise((r) => setTimeout(r, 1500));
    
    // mark verified in Firestore via a client-side call
    try {
      const mod = await import('firebase/firestore');
      const { doc, updateDoc } = mod;
      const { db } = await import('@/lib/firebase');
      if (user) {
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { verified: true });
      }
    } catch {
      // ignore; verification state may not persist in some environments
    }
    
    // Complete progress
    setProgress(100);
    clearInterval(interval);
    
    // give AuthContext a moment to pick up changes
    setTimeout(() => {
      setVerifying(false);
      router.push('/user-dashboard');
    }, 600);
  };

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

          {/* Verification Card */}
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
                    Verify your identity
                  </motion.h2>
                  <motion.p 
                    className="text-sm theme-text-muted"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Secure access to your dashboard
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
                Identity Verification Required
              </motion.div>

              {/* Verification Content */}
              <div className="space-y-6">
                {/* Description */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="theme-text-muted mb-4">
                    To continue to your user dashboard, connect with DigiLocker for secure document verification. 
                    This ensures the security and authenticity of your account.
                  </p>
                </motion.div>

                {/* Verification Steps */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                    <FileCheck className="w-5 h-5 text-accent-gradient" />
                    <div className="text-left">
                      <p className="text-sm font-medium theme-text-primary">Document Verification</p>
                      <p className="text-xs theme-text-muted">Secure identity confirmation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                    <Lock className="w-5 h-5 text-accent-gradient" />
                    <div className="text-left">
                      <p className="text-sm font-medium theme-text-primary">Encrypted Process</p>
                      <p className="text-xs theme-text-muted">Your data is protected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg theme-bg-glass">
                    <UserCheck className="w-5 h-5 text-accent-gradient" />
                    <div className="text-left">
                      <p className="text-sm font-medium theme-text-primary">Instant Access</p>
                      <p className="text-xs theme-text-muted">Quick verification process</p>
                    </div>
                  </div>
                </motion.div>

                {/* Progress Bar */}
                <AnimatePresence>
                  {verifying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="w-full bg-gray-200 rounded-full h-2 theme-bg-glass">
                        <motion.div
                          className="h-2 rounded-full accent-gradient"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-xs theme-text-muted text-center">
                        {progress < 100 ? 'Verifying your identity...' : 'Verification complete!'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Button */}
                <motion.button
                  onClick={startMockVerification}
                  disabled={verifying}
                  className="w-full py-3 rounded-xl accent-gradient text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={!verifying ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!verifying ? { scale: 0.98 } : {}}
                  variants={itemVariants}
                >
                  {verifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5" />
                      Connect to DigiLocker (mock)
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Security Note */}
              <motion.p 
                className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Shield className="w-3 h-3" />
                Your data is securely encrypted and protected during verification
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}