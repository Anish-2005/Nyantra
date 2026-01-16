import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DisbursementsPreviewProps {
  t: (key: string) => string;
  recentDisbursements: any[];
  loading: boolean;
  getStatusText: (status: string) => string;
}

const DisbursementsPreview: React.FC<DisbursementsPreviewProps> = ({
  t,
  recentDisbursements,
  loading,
  getStatusText
}) => {
  const router = useRouter();

  return (
    <motion.div
      className="theme-bg-card theme-border-glass border-2 rounded-3xl p-6 backdrop-blur-xl shadow-sm group relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(45deg, rgba(168, 85, 247, 0.5) 25%, transparent 25%, transparent 75%, rgba(168, 85, 247, 0.5) 75%, rgba(168, 85, 247, 0.5)), linear-gradient(45deg, rgba(168, 85, 247, 0.5) 25%, transparent 25%, transparent 75%, rgba(168, 85, 247, 0.5) 75%, rgba(168, 85, 247, 0.5))',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Wallet className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold theme-text-primary">{t('dashboard.disbursements.recentDisbursements')}</h3>
              <p className="text-sm theme-text-muted">{t('dashboard.disbursements.latestPaymentTransactions')}</p>
            </div>
          </div>
          <motion.button
            onClick={() => router.push('/dashboard/disbursements')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t('dashboard.common.viewFull')}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="relative p-4 rounded-xl theme-bg-glass border theme-border-glass flex items-center gap-4 animate-pulse"
              />
            ))
          ) : recentDisbursements.length === 0 ? (
            <div className="p-4 text-center theme-text-muted">{t('dashboard.disbursements.noRecords') || 'No disbursements found.'}</div>
          ) : (
            recentDisbursements.map((disbursement: any, idx: number) => {
              const did = disbursement.id || disbursement.code || disbursement.disbursementId || '';
              const name = disbursement.beneficiary || disbursement.beneficiaryName || disbursement.name || 'Unknown';
              const amount = disbursement.amount !== undefined ? (typeof disbursement.amount === 'number' ? '₹' + disbursement.amount.toLocaleString() : disbursement.amount) : '—';
              const status = disbursement.status || 'processing';
              const date = disbursement.date || (disbursement.disbursementDate ? new Date(disbursement.disbursementDate.toDate()).toLocaleDateString() : 'N/A');
              const color = disbursement.color || (status === 'completed' ? 'bg-green-500' : 'bg-blue-500');
              return (
                <motion.div
                  key={did + idx}
                  className="relative p-4 rounded-xl theme-bg-glass border theme-border-glass flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className={`w-2 h-16 rounded-full ${color} absolute left-0`} />
                  <div className="flex-1 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold theme-text-primary text-sm">{name}</p>
                        <p className="text-xs theme-text-muted">{did}</p>
                      </div>
                      <span className="font-bold text-lg theme-text-primary">{amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                        {getStatusText(status)}
                      </span>
                      <span className="text-xs theme-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Decorative orb */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
    </motion.div>
  );
};

export default DisbursementsPreview;