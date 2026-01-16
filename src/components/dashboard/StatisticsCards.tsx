import React from "react";
import { User, Clock, Eye, Check, X, AlertCircle } from "lucide-react";

interface Stat {
  status: string;
  label: string;
  count: number;
  Icon: React.ElementType;
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

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats, theme, t }) => {
  const list: Stat[] = [
    {
      status: "pending",
      label: t("applications.stats.pending"),
      count: stats.pending,
      Icon: Clock,
    },
    {
      status: "in-review",
      label: t("applications.stats.inReview"),
      count: stats.inReview,
      Icon: Eye,
    },
    {
      status: "approved",
      label: t("applications.stats.approved"),
      count: stats.approved,
      Icon: Check,
    },
    {
      status: "rejected",
      label: t("applications.stats.rejected"),
      count: stats.rejected,
      Icon: X,
    },
    {
      status: "documents-required",
      label:
        t("applications.stats.docsRequired") ||
        t("applications.stats.documentsrequired"),
      count: stats.documentsRequired,
      Icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Total Applications */}
      <div className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-lg accent-gradient flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold theme-text-primary">
            {stats.total}
          </span>
        </div>
        <p className="text-sm font-medium theme-text-muted">
          {t("applications.stats.total")}
        </p>
      </div>
      {list.map((s) => (
        <div
          key={s.status}
          className="theme-bg-card theme-border-glass border rounded-xl p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                theme === "light"
                  ? s.status === "approved"
                    ? "bg-green-500"
                    : s.status === "pending"
                    ? "bg-amber-400"
                    : s.status === "in-review"
                    ? "bg-blue-400"
                    : s.status === "rejected"
                    ? "bg-red-400"
                    : "bg-purple-400"
                  : s.status === "approved"
                  ? "bg-green-700"
                  : s.status === "pending"
                  ? "bg-amber-600"
                  : s.status === "in-review"
                  ? "bg-blue-700"
                  : s.status === "rejected"
                  ? "bg-red-700"
                  : "bg-purple-700"
              }`}
            >
              <s.Icon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold theme-text-primary">
              {s.count}
            </span>
          </div>
          <p className="text-sm font-medium theme-text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
