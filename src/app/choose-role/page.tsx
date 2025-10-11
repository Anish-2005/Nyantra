"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Sun, 
  Moon, 
  Shield,
  User,
  Users,
  ArrowRight,
  Rocket
} from 'lucide-react';

export default function ChooseRolePage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && profile?.role) {
      // role already chosen; redirect accordingly
      if (profile.role === 'officer') router.push('/dashboard');
      else if (profile.role === 'user') {
        if (profile.verified) router.push('/user-dashboard');
        else router.push('/verify');
      }
    }
  }, [user, profile, loading, router]);

  const pickRole = async (role: 'officer' | 'user') => {
    if (!user) return;
    try {
      const fb = await import('@/lib/firebase');
      const mod = await import('firebase/firestore');
      const { doc, setDoc, serverTimestamp } = mod;
      const ref = doc(fb.db, 'users', user.uid);
      // use setDoc with merge to create or update safely; include createdAt when creating
      await setDoc(ref, { role, verified: role === 'officer' ? true : false, createdAt: serverTimestamp() }, { merge: true });
      if (role === 'officer') router.push('/dashboard');
      else router.push('/verify');
    } catch (err: unknown) {
      // Surface firebase permission errors clearly without using `any`
      try { console.error('[choose-role] failed to update profile', err); } catch {}
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as Record<string, unknown>).code : undefined;
      if (code === 'permission-denied') {
        alert('Permission denied: your Firestore rules prevent updating your profile. Check security rules or sign-in state.');
      }
      // stay on choose-role so user can retry
      router.push('/choose-role');
    }
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

          {/* Role Selection Card */}
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
                    Choose your role
                  </motion.h2>
                  <motion.p 
                    className="text-sm theme-text-muted"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Select how you&apos;ll use the platform
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

              {/* Role Selection */}
              <div className="space-y-4">
                {/* User Role Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl theme-bg-glass theme-border-glass border cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => pickRole('user')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg theme-bg-card flex items-center justify-center">
                      <User className="w-6 h-6 text-accent-gradient" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold theme-text-primary">I&apos;m a User</h3>
                      <p className="text-sm theme-text-muted mt-1">
                        Access benefits and services as a beneficiary
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 theme-text-muted" />
                  </div>
                </motion.div>

                {/* Officer Role Card */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl accent-gradient text-white cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => pickRole('officer')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">I&apos;m an Officer</h3>
                      <p className="text-sm text-white/80 mt-1">
                        Manage and oversee platform operations
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              </div>

              {/* Role Descriptions */}
              <motion.div 
                className="mt-6 grid grid-cols-2 gap-4 text-xs"
                variants={itemVariants}
              >
                <div className="text-center theme-text-muted">
                  <User className="w-4 h-4 mx-auto mb-1" />
                  <p>For beneficiaries receiving services and benefits</p>
                </div>
                <div className="text-center theme-text-muted">
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  <p>For administrators managing the platform</p>
                </div>
              </motion.div>

              {/* Security Note */}
              <motion.p 
                className="mt-6 text-xs theme-text-muted text-center flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Shield className="w-3 h-3" />
                Your role can be updated later by platform administrators
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}