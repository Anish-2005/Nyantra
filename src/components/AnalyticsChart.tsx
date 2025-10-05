/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

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
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [LineComp, setLineComp] = useState<any>(null);
  const [BarComp, setBarComp] = useState<any>(null);

  // Generate fallback mock data
  const now = Date.now();
  const mock = Array.from({ length: 30 }).map((_, i) => ({
    x: now - (29 - i) * 24 * 60 * 60 * 1000,
    y: Math.round(40 + Math.sin(i / 3) * 20 + Math.random() * 10),
  }));
  const sets =
    dataSets && dataSets.length
      ? dataSets
      : [{ id: "applications", label: "Applications", points: mock }];

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

  // Create gradient after chart mount and on theme change
  useEffect(() => {
    if (!componentsLoaded) return;
    const chart = chartRef.current?.chartInstance || chartRef.current?.chart || chartRef.current;
    if (!chart) return;

    try {
      const ctx = chart.ctx as CanvasRenderingContext2D;
      const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
      if (theme === "dark") {
        gradient.addColorStop(0, "rgba(139,92,246,0.28)");
        gradient.addColorStop(1, "rgba(139,92,246,0.02)");
      } else {
        gradient.addColorStop(0, "rgba(59,130,246,0.28)");
        gradient.addColorStop(1, "rgba(59,130,246,0.02)");
      }

      const datasets = (chart.data?.datasets ?? []) as any[];
      datasets.forEach((ds, idx: number) => {
        if (idx === 0) ds.backgroundColor = gradient;
        ds.borderColor = ds.borderColor || (theme === "dark" ? "rgba(139,92,246,1)" : "rgba(59,130,246,1)");
      });

      chart.update();
    } catch (e) {
      // ignore gradient errors
    }
  }, [theme, componentsLoaded]);

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
        pointRadius: 3,
        pointHoverRadius: 5,
        hoverBorderWidth: 2,
      };

      if (chartType === "bar" || chartType === "stacked") {
        return { ...base, type: "bar" as const, borderWidth: 1 };
      }

      return { ...base, fill: chartType === "area", tension: 0.3 };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", axis: "x", intersect: false },
    plugins: {
      legend: { display: true, position: "top", labels: { color: theme === "dark" ? "#cbd5e1" : "#0f172a" } },
      tooltip: { enabled: true, mode: "nearest", intersect: false },
      title: { display: true, text: "", color: theme === "dark" ? "#cbd5e1" : "#0f172a" },
      zoom: { pan: { enabled: true, mode: "x", modifierKey: "ctrl" }, zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" } },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "day", tooltipFormat: "PP" },
        ticks: { color: theme === "dark" ? "#94a3b8" : "#475569" },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: theme === "dark" ? "#94a3b8" : "#475569" },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)" },
        stacked: chartType === "stacked",
      },
    },
  };

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
    <div className="w-full h-64 sm:h-80 md:h-96 relative rounded-lg overflow-hidden shadow-sm">
      {chartType === "bar" || chartType === "stacked" ? (
        <BarC ref={chartRef} data={chartData} options={options} />
      ) : (
        <LineC ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  );
}
