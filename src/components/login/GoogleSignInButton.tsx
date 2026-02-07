interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading: boolean;
  t: (key: string) => string;
  className?: string;
}

export const GoogleSignInButton = ({ onClick, isLoading, t, className = '' }: GoogleSignInButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-2.5 rounded-lg border theme-border-glass theme-bg-glass flex items-center justify-center gap-3 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <span aria-hidden className="w-5 h-5 inline-block flex-shrink-0">
            <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M533.5 278.4c0-18.5-1.6-36.2-4.7-53.4H272v101.1h147.4c-6.3 34.2-25.8 63.2-55 82.6v68.5h88.8c52-48 81.3-118.6 81.3-198.8z" fill="#4285F4" />
              <path d="M272 544.3c73.7 0 135.6-24.6 180.8-66.8l-88.8-68.5c-24.7 16.6-56.4 26.4-92 26.4-70.7 0-130.6-47.8-152-112.1H29.7v70.4C74.5 485.9 168 544.3 272 544.3z" fill="#34A853" />
              <path d="M120 325.3c-10.6-31.4-10.6-65.2 0-96.6V158.3H29.7c-40.3 80.6-40.3 174.5 0 255.1L120 325.3z" fill="#FBBC05" />
              <path d="M272 107.7c38.9 0 73.9 13.4 101.5 39.6l76-76C407.6 24 345.7 0 272 0 168 0 74.5 58.4 29.7 158.3l90.3 70.4C141.4 155.5 201.3 107.7 272 107.7z" fill="#EA4335" />
            </svg>
          </span>
          <span className="theme-text-primary font-medium">{t('extracted.continue_with_google')}</span>
        </>
      )}
    </button>
  );
};