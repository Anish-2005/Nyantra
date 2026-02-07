/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";

type DataPoint = { x: string | number | Date; y: number };

export default function AnalyticsChart({
  dataSets,
  chartType = "line",
  xScaleType = "time",
}: {
  dataSets?: { id: string; label: string; color?: string; points: DataPoint[] }[];
  chartType?: "line" | "area" | "bar" | "stacked";
  xScaleType?: "time" | "category";
}) {
  const chartRef = useRef<any>(null);
  const { theme } = useTheme();
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [LineComp, setLineComp] = useState<any>(null);
  const [BarComp, setBarComp] = useState<any>(null);

  // Generate fallback mock data only if no dataSets provided
  const mockData = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 30 }).map((_, i) => ({
      x: now - (29 - i) * 24 * 60 * 60 * 1000,
      y: Math.round(40 + Math.sin(i / 3) * 20 + Math.random() * 10),
    }));
  }, []);

  // Use provided dataSets or fallback to mock
  const sets = useMemo(() => {
    return dataSets && dataSets.length > 0
      ? dataSets
      : [{ id: "applications", label: "Applications", points: mockData }];
  }, [dataSets, mockData]);

  // Set mobile state on client side
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Shape datasets depending on chartType
  const chartData = useMemo(() => ({
    datasets: sets.map((s, i) => {
      const base = {
        label: s.label,
        data: s.points,
        parsing: false,
        borderColor:
          s.color || (i === 0 ? (theme === "dark" ? "rgba(139,92,246,1)" : "rgba(59,130,246,1)") : `rgba(99,102,241,${0.8 - i * 0.2})`),
        backgroundColor: s.color ? s.color : theme === "dark" ? "rgba(139,92,246,0.2)" : "rgba(59,130,246,0.12)",
        tension: 0.4,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 5 : 6,
        hoverBorderWidth: 2,
        borderWidth: isMobile ? 2 : 2.5,
      };

      if (chartType === "bar" || chartType === "stacked") {
        return {
          ...base,
          type: "bar" as const,
          borderWidth: 0,
          barThickness: isMobile ? 10 : undefined,
          maxBarThickness: isMobile ? 15 : 30
        };
      }

      return { ...base, fill: chartType === "area", tension: 0.4 };
    }),
  }), [sets, chartType, theme, isMobile]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    interaction: {
      mode: "index" as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: isMobile ? "bottom" : "top" as const,
        labels: {
          color: theme === "dark" ? "#cbd5e1" : "#0f172a",
          font: {
            size: isMobile ? 10 : 12,
            family: "'Inter', sans-serif"
          },
          padding: isMobile ? 8 : 16,
          boxWidth: isMobile ? 10 : 12,
          boxHeight: isMobile ? 10 : 12,
          usePointStyle: true
        }
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: theme === "dark" ? "#f1f5f9" : "#0f172a",
        bodyColor: theme === "dark" ? "#cbd5e1" : "#475569",
        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: isMobile ? 10 : 12,
        titleFont: {
          size: isMobile ? 12 : 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        displayColors: true,
        boxPadding: 6
      },
      title: { display: false },
      zoom: {
        pan: {
          enabled: !isMobile,
          mode: "x" as const,
          modifierKey: "ctrl" as const
        },
        zoom: {
          wheel: { enabled: !isMobile, speed: 0.1 },
          pinch: { enabled: true },
          mode: "x" as const
        }
      },
    },
    scales: {
      x: {
        type: xScaleType,
        ...(xScaleType === 'time' ? {
          time: {
            unit: "day" as const,
            tooltipFormat: "PP",
            displayFormats: {
              day: 'MMM d'
            }
          }
        } : {}),
        ticks: {
          color: theme === "dark" ? "#94a3b8" : "#475569",
          font: {
            size: isMobile ? 10 : 12
          },
          maxTicksLimit: isMobile ? 5 : 8,
          maxRotation: 0,
          autoSkip: true
        },
        grid: {
          color: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)",
          drawBorder: false
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === "dark" ? "#94a3b8" : "#475569",
          font: {
            size: isMobile ? 10 : 12
          },
          maxTicksLimit: isMobile ? 5 : 7,
          precision: 0
        },
        grid: {
          color: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)",
          drawBorder: false
        },
        stacked: chartType === "stacked",
      },
    },
  }), [theme, isMobile, xScaleType, chartType]);

  if (!componentsLoaded || (!LineComp && !BarComp)) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm theme-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Loading chart...
        </div>
      </div>
    );
  }

  const LineC = LineComp;
  const BarC = BarComp;

  return (
    <div className="w-full h-full relative">
      {chartType === "bar" || chartType === "stacked" ? (
        <BarC ref={chartRef} data={chartData} options={options} />
      ) : (
        <LineC ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  );
}
