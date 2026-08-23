'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * Two drifting accent-gradient orbs behind the dashboard shell.
 * Pure CSS transform animations (compositor-only, zero main-thread cost),
 * reduced to a single cheaper orb on mobile and fully static when the user
 * prefers reduced motion.
 */
export function GradientOrbs() {
  const { theme } = useTheme();
  const opacity = theme === 'dark' ? 'opacity-15' : 'opacity-20';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      <style>{`
        @keyframes orb-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(100px, 50px, 0); }
        }
        @keyframes orb-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-100px, -50px, 0); }
        }
        .orb {
          position: absolute;
          border-radius: 9999px;
          will-change: transform;
        }
        .orb-a {
          top: -50%; left: -50%;
          width: 100%; height: 100%;
          filter: blur(64px);
          animation: orb-drift-a 22s ease-in-out infinite;
        }
        .orb-b {
          bottom: -50%; right: -50%;
          width: 100%; height: 100%;
          filter: blur(64px);
          animation: orb-drift-b 16s ease-in-out infinite;
        }
        @media (max-width: 767px) {
          .orb-a {
            top: -25%; left: -30%;
            width: 80%; height: 80%;
            filter: blur(60px) saturate(.8);
            animation-duration: 36s;
            opacity: .45;
          }
          .orb-b { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-a, .orb-b { animation: none; }
        }
      `}</style>
      <div className={`orb orb-a accent-gradient ${opacity}`} />
      <div className={`orb orb-b accent-gradient ${opacity}`} />
    </div>
  );
}
