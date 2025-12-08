"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { Plus, Send, Loader2 } from "lucide-react";

export default function AddBlockForm({ onSuccess }: any) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [form, setForm] = useState({
    beneficiary_id: "",
    utp_number: "",
    transaction_id: "",
    amount: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/blockchain", {
        method: "POST",
        body: JSON.stringify({
          transactions: [
            {
              beneficiary_id: form.beneficiary_id,
              utp_number: form.utp_number,
              transaction_id: form.transaction_id,
              amount: Number(form.amount)
            }
          ]
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage(t('blockchain.blockAddedSuccessfully'));
        setForm({
          beneficiary_id: "",
          utp_number: "",
          transaction_id: "",
          amount: ""
        });
        onSuccess();
      } else {
        setMessage("Error: " + data.message);
      }
    } catch {
      setMessage(t('blockchain.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-bg-glass theme-border-glass border backdrop-blur-xl rounded-xl p-8"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold theme-text-primary">{t('blockchain.addNewBlock')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: "beneficiary_id", label: t('blockchain.beneficiaryId'), placeholder: t('blockchain.enterBeneficiaryId'), type: "text" },
            { key: "utp_number", label: t('blockchain.utpNumber'), placeholder: t('blockchain.enterUtpNumber'), type: "text" },
            { key: "transaction_id", label: t('blockchain.transactionId'), placeholder: t('blockchain.enterTransactionId'), type: "text" },
            { key: "amount", label: t('blockchain.amount'), placeholder: t('blockchain.enterAmount'), type: "number" }
          ].map((field) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * ["beneficiary_id", "utp_number", "transaction_id", "amount"].indexOf(field.key) }}
            >
              <label className="block text-sm font-medium theme-text-primary mb-2">
                {field.label} *
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl theme-bg-glass theme-border-glass border theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 placeholder:theme-text-muted"
                required
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('blockchain.addingBlock')}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('blockchain.addBlock')}</span>
            </>
          )}
        </motion.button>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl backdrop-blur-xl border ${
              message.includes('success') || message.includes('Success')
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            {message}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
