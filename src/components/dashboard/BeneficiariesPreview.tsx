import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, CheckCircle, Clock, Fingerprint, MapPin, Scale, DollarSign, Banknote, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BeneficiariesPreviewProps {
  t: (key: string) => string;
  beneficiaries: any[];
  loading: boolean;
  formatActType: (val?: string) => string;
  formatCurrency: (n?: number | null) => string;
  getStatusColor: (status: string) => string;
  getVerificationColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
}

const BeneficiariesPreview: React.FC<BeneficiariesPreviewProps> = ({
  t,
  beneficiaries,
  loading,
  formatActType,
  formatCurrency,
  getStatusColor,
  getVerificationColor,
  getStatusIcon
}) => {
  const router = useRouter();

  return (
    <motion.div
      className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold theme-text-primary">{t('dashboard.beneficiaries.verifiedBeneficiaries')}</h3>
              <p className="text-sm theme-text-muted">{t('dashboard.beneficiaries.activeProfilesWithFullVerification')}</p>
            </div>
          </div>
          <motion.button
            onClick={() => router.push('/dashboard/beneficiaries')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t('dashboard.common.viewFull')}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {beneficiaries.map((beneficiary: any, idx: number) => {
            const StatusIcon = beneficiary.status === 'verified' ? CheckCircle : Clock;
            const VerificationIcon = beneficiary.verificationStatus === 'verified' ? CheckCircle : Clock;

            return (
              <motion.div
                key={beneficiary.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileTap={{ scale: 0.995 }}
                className="theme-bg-glass theme-border-glass border rounded-xl p-4 active:bg-opacity-80"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                      {beneficiary.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold theme-text-primary truncate">{beneficiary.name}</p>
                      <p className="text-xs theme-text-muted truncate">{beneficiary.beneficiaryId}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                    beneficiary.category === 'SC' ? 'text-purple-700 bg-purple-100 border-purple-300 dark:text-purple-300 dark:bg-purple-900/30 dark:border-purple-700' :
                    beneficiary.category === 'ST' ? 'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-700' :
                    'text-gray-700 bg-gray-100 border-gray-300 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600'
                  }`}>
                    {beneficiary.category}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5" />
                      Aadhaar
                    </span>
                    <span className="theme-text-primary font-mono text-[10px]">{beneficiary.aadhaarNumber || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </span>
                    <span className="theme-text-primary font-medium">{beneficiary.district}, {beneficiary.state}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Act Type
                    </span>
                    <span className="theme-text-primary font-medium">{formatActType(beneficiary.actType)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Relief Amount
                    </span>
                    <span className="theme-text-primary font-bold">{formatCurrency(beneficiary.reliefAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5" />
                      Disbursed
                    </span>
                    <span className="theme-text-primary font-medium">{formatCurrency(beneficiary.disbursedAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-muted flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Assigned Officer
                    </span>
                    <span className="theme-text-primary font-medium truncate max-w-[150px]">{beneficiary.assignedOfficer || '—'}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b theme-border-glass">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(beneficiary.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{beneficiary.status.replace('-', ' ')}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getVerificationColor(beneficiary.verificationStatus)}`}>
                    <VerificationIcon className="w-3 h-3" />
                    <span className="capitalize">{beneficiary.verificationStatus.replace('-', ' ')}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorative orb */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
    </motion.div>
  );
};

export default BeneficiariesPreview;