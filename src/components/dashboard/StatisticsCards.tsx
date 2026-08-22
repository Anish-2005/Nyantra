import React from "react";
import { User, Clock, Eye, Check, X, AlertCircle } from "lucide-react";

interface Stat {
  status: string;
  label: string;
  count: number;
  Icon: React.ElementType;
  dot: string;
}

interface StatisticsCardsProps {
  stats: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    documentsRequired: number;
  };
  theme: string;
  t: (key: string, options?: any) => string;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats, t }) => {
  const list: Stat[] = [
    { status: "pending", label: t("applications.stats.pending"), count: stats.pending, Icon: Clock, dot: "bg-amber-500" },
    { status: "in-review", label: t("applications.stats.inReview"), count: stats.inReview, Icon: Eye, dot: "bg-blue-500" },
    { status: "approved", label: t("applications.stats.approved"), count: stats.approved, Icon: Check, dot: "bg-emerald-500" },
    { status: "rejected", label: t("applications.stats.rejected"), count: stats.rejected, Icon: X, dot: "bg-red-500" },
    {
      status: "documents-required",
      label: t("applications.stats.docsRequired") || t("applications.stats.documentsrequired"),
      count: stats.documentsRequired,
      Icon: AlertCircle,
      dot: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px theme-bg-glass border theme-border-glass rounded-xl overflow-hidden">
      <div className="theme-bg-card p-4 relative overflow-hidden group">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
          <User className="w-3.5 h-3.5" />
          <span className="truncate">{t("applications.stats.total")}</span>
        </div>
        <p className="text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">{stats.total}</p>
        <div className="absolute inset-x-0 bottom-0 h-0.5 accent-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </div>
      {list.map((s) => (
        <div key={s.status} className="theme-bg-card p-4 relative overflow-hidden group">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            <span className="truncate">{s.label}</span>
          </div>
          <p className="text-2xl font-semibold tracking-tight theme-text-primary mt-1.5 tabular-nums">{s.count}</p>
          <div className="absolute inset-x-0 bottom-0 h-0.5 theme-bg-glass scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
