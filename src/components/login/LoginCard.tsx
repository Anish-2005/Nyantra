import { motion } from 'framer-motion';
import { LoginHeader } from './LoginHeader';
import { StatusBadge } from './StatusBadge';
import { LoginForm } from './LoginForm';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoginFooter } from './LoginFooter';

interface LoginCardProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isRegister: boolean;
  setIsRegister: (isRegister: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  t: (key: string) => string;
  className?: string;
}

export const LoginCard = ({
  email,
  setEmail,
  password,
  setPassword,
  isRegister,
  setIsRegister,
  error,
  isLoading,
  onSubmit,
  onGoogleSignIn,
  t,
  className = ''
}: LoginCardProps) => {
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
    <motion.div
      variants={itemVariants}
      className={`theme-bg-card theme-border-card border rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 accent-gradient opacity-5 pointer-events-none z-0 rounded-xl" aria-hidden />

      <div className="relative z-10">
        <LoginHeader isRegister={isRegister} t={t} />
        <StatusBadge />

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isRegister={isRegister}
          error={error}
          isLoading={isLoading}
          onSubmit={onSubmit}
          onGoogleSignIn={onGoogleSignIn}
        />

        <div className="mt-4">
          <GoogleSignInButton
            onClick={onGoogleSignIn}
            isLoading={isLoading}
            t={t}
          />
        </div>

        <LoginFooter
          isRegister={isRegister}
          onToggleMode={() => setIsRegister(!isRegister)}
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
};