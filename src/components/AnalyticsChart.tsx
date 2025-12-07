/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

type DataPoint = { x: string | number | Date; y: number };

export default function AnalyticsChart({
  dataSets,
  chartType = "line",
}: {
  dataSets?: { id: string; label: string; color?: string; points: DataPoint[] }[];
  chartType?: "line" | "area" | "bar" | "stacked";
}) {
  const chartRef = useRef<any>(null);
  const { theme } = useTheme();
  const { user } = useAuth();
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [LineComp, setLineComp] = useState<any>(null);
  const [BarComp, setBarComp] = useState<any>(null);
  const [realData, setRealData] = useState<{ id: string; label: string; color?: string; points: DataPoint[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        applicationDate: doc.data().applicationDate?.toDate?.() || new Date()
      }));

      // Process data for different chart types
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      // Applications over time
      const applicationsOverTime = last30Days.map(date => {
        const count = applications.filter(app => {
          const appDate = new Date(app.applicationDate);
          appDate.setHours(0, 0, 0, 0);
          return appDate.getTime() === date.getTime();
        }).length;
        return { x: date, y: count };
      });

      // Status distribution (for bar chart)
      const statusCounts = applications.reduce((acc, app) => {
        const status = app.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        x: status,
        y: count
      }));

      // Amount over time (if amount data exists)
      const amountOverTime = last30Days.map(date => {
        const total = applications
          .filter(app => {
            const appDate = new Date(app.applicationDate);
            appDate.setHours(0, 0, 0, 0);
            return appDate.getTime() === date.getTime();
          })
          .reduce((sum, app) => sum + (app.amount || 0), 0);
        return { x: date, y: total };
      });

      const chartData = [
        {
          id: "applications",
          label: "Applications Over Time",
          points: applicationsOverTime,
          color: theme === "dark" ? "rgba(59,130,246,1)" : "rgba(59,130,246,1)"
        },
        {
          id: "amounts",
          label: "Amount Over Time (₹)",
          points: amountOverTime,
          color: theme === "dark" ? "rgba(16,185,129,1)" : "rgba(16,185,129,1)"
        },
        {
          id: "status",
          label: "Applications by Status",
          points: statusData,
          color: theme === "dark" ? "rgba(245,158,11,1)" : "rgba(245,158,11,1)"
        }
      ];

      setRealData(chartData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, theme]);

  // Generate fallback mock data
  const now = Date.now();
  const mock = Array.from({ length: 30 }).map((_, i) => ({
    x: now - (29 - i) * 24 * 60 * 60 * 1000,
    y: Math.round(40 + Math.sin(i / 3) * 20 + Math.random() * 10),
  }));

  // Use real data if available, otherwise fallback to mock data
  const sets = dataSets && dataSets.length
    ? dataSets
    : realData.length > 0
    ? realData
    : [{ id: "applications", label: "Applications", points: mock }];

  // Set mobile state on client side
  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  // Dynamically import chart.js + react-chartjs-2 to avoid SSR issues
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ChartJS = await import("chart.js");
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      await import("chartjs-adapter-date-fns");
      const { Line: RLine, Bar: RBar } = await import("react-chartjs-2");

      ChartJS.Chart.register(
        ChartJS.LineElement,
        ChartJS.PointElement,
        ChartJS.LinearScale,
        ChartJS.CategoryScale,
        ChartJS.Title,
        ChartJS.Tooltip,
        ChartJS.Legend,
        ChartJS.Filler,
        ChartJS.TimeScale,
        ChartJS.BarElement,
        ChartJS.BarController,
        zoomPlugin
      );

      if (!mounted) return;
      setLineComp(() => RLine);
      setBarComp(() => RBar);
      setComponentsLoaded(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle window resize for responsive chart updates
  useEffect(() => {
    const handleResize = () => {
      const chart = chartRef.current?.chartInstance || chartRef.current?.chart || chartRef.current;
      if (chart) {
        chart.resize();
        chart.update();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shape datasets depending on chartType
  const chartData = {
    datasets: sets.map((s, i) => {
      const base = {
        label: s.label,
        data: s.points,
        parsing: false,
        borderColor:
          s.color || (i === 0 ? (theme === "dark" ? "rgba(139,92,246,1)" : "rgba(59,130,246,1)") : `rgba(99,102,241,${0.8 - i * 0.2})`),
        backgroundColor: s.color ? s.color : theme === "dark" ? "rgba(139,92,246,0.2)" : "rgba(59,130,246,0.12)",
        tension: 0.3,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 4 : 5,
        hoverBorderWidth: 2,
        borderWidth: isMobile ? 1.5 : 2,
      };

      if (chartType === "bar" || chartType === "stacked") {
        return {
          ...base,
          type: "bar" as const,
          borderWidth: isMobile ? 1 : 1,
          barThickness: isMobile ? 8 : undefined,
          maxBarThickness: isMobile ? 12 : undefined
        };
      }

      return { ...base, fill: chartType === "area", tension: 0.3 };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", axis: "x", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: window.innerWidth < 640 ? "bottom" : "top",
        labels: {
          color: theme === "dark" ? "#cbd5e1" : "#0f172a",
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          },
          padding: window.innerWidth < 640 ? 8 : 16,
          boxWidth: window.innerWidth < 640 ? 8 : 12,
          boxHeight: window.innerWidth < 640 ? 8 : 12
        }
      },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: theme === "dark" ? "#f1f5f9" : "#0f172a",
        bodyColor: theme === "dark" ? "#cbd5e1" : "#475569",
        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: window.innerWidth < 640 ? 8 : 12,
        titleFont: {
          size: window.innerWidth < 640 ? 12 : 14
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 11 : 13
        }
      },
      title: { display: true, text: "", color: theme === "dark" ? "#cbd5e1" : "#0f172a" },
      zoom: {
        pan: {
          enabled: window.innerWidth >= 640,
          mode: "x",
          modifierKey: "ctrl"
        },
        zoom: {
          wheel: { enabled: window.innerWidth >= 640 },
          pinch: { enabled: true },
          mode: "x"
        }
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "day", tooltipFormat: "PP" },
        ticks: {
          color: theme === "dark" ? "#94a3b8" : "#475569",
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          },
          maxTicksLimit: window.innerWidth < 640 ? 5 : 7
        },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === "dark" ? "#94a3b8" : "#475569",
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          },
          maxTicksLimit: window.innerWidth < 640 ? 4 : 6
        },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)" },
        stacked: chartType === "stacked",
      },
    },
  };

  // Handle window resize for responsive chart updates
  useEffect(() => {
    const handleResize = () => {
      const chart = chartRef.current?.chartInstance || chartRef.current?.chart || chartRef.current;
      if (chart) {
        chart.resize();
        chart.update();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!componentsLoaded || (!LineComp && !BarComp)) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-sm text-gray-500">
        Loading chart...
      </div>
    );
  }

  const LineC = LineComp;
  const BarC = BarComp;

  return (
    <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 relative rounded-lg overflow-hidden shadow-sm">
      {chartType === "bar" || chartType === "stacked" ? (
        <BarC ref={chartRef} data={chartData} options={options} />
      ) : (
        <LineC ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  );
}
