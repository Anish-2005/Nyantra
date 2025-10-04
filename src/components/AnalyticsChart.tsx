"use client";
import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler, TimeScale, BarElement, BarController } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@/context/ThemeContext';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler, TimeScale, BarElement, BarController, zoomPlugin);

type DataPoint = { x: string | number | Date; y: number };

export default function AnalyticsChart({
  dataSets,
  refExport,
  chartType = 'line'
}: {
  dataSets?: { id: string; label: string; color?: string; points: DataPoint[] }[];
  refExport?: React.MutableRefObject<((csv?: string) => void) | null>;
  chartType?: 'line' | 'area' | 'bar' | 'stacked';
}) {
  const chartRef = useRef<any>(null);
  const { theme } = useTheme();

  // generate fallback mock data (daily points)
  const now = Date.now();
  const mock = Array.from({ length: 30 }).map((_, i) => ({ x: now - (29 - i) * 24 * 60 * 60 * 1000, y: Math.round(40 + Math.sin(i / 3) * 20 + Math.random() * 10) }));
  const sets = dataSets && dataSets.length ? dataSets : [
    { id: 'applications', label: 'Applications', color: undefined, points: mock },
  ];

  // Create gradient on mount
  useEffect(() => {
    const chart = chartRef.current?.chartInstance || chartRef.current?.chart;
    if (!chart) return;
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
    if (theme === 'dark') {
      gradient.addColorStop(0, 'rgba(139,92,246,0.28)');
      gradient.addColorStop(1, 'rgba(139,92,246,0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(59,130,246,0.28)');
      gradient.addColorStop(1, 'rgba(59,130,246,0.02)');
    }
    chart.data.datasets.forEach((ds: any, idx: number) => {
      // apply gradient for first dataset only
      if (idx === 0) ds.backgroundColor = gradient;
      // ensure border color exists
      ds.borderColor = ds.borderColor || (theme === 'dark' ? 'rgba(139,92,246,1)' : 'rgba(59,130,246,1)');
    });
    chart.update();
  }, [theme]);

  // shape datasets depending on chartType
  const chartData: any = {
    datasets: sets.map((s, i) => {
      const base = {
        label: s.label,
        data: s.points,
        parsing: false,
        borderColor: s.color || (i === 0 ? (theme === 'dark' ? 'rgba(139,92,246,1)' : 'rgba(59,130,246,1)') : `rgba(99,102,241,${0.8 - i * 0.2})`),
        backgroundColor: s.color ? s.color : (theme === 'dark' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.12)'),
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        hoverBorderWidth: 2
      };

      if (chartType === 'bar' || chartType === 'stacked') {
        return {
          ...base,
          type: 'bar',
          borderWidth: 1,
          backgroundColor: base.backgroundColor,
        };
      }

      // line/area
      return {
        ...base,
        fill: chartType === 'area' ? true : (i === 0 && chartType === 'line' ? true : false),
        tension: chartType === 'line' || chartType === 'area' ? 0.3 : 0,
      };
    })
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    plugins: {
      legend: { display: true, position: 'top', labels: { color: theme === 'dark' ? '#cbd5e1' : '#0f172a' } },
      tooltip: { enabled: true, mode: 'nearest', intersect: false },
      title: { display: true, text: 'Applications over time', color: theme === 'dark' ? '#cbd5e1' : '#0f172a' },
      zoom: {
        pan: { enabled: true, mode: 'x', modifierKey: 'ctrl' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
      }
    },
    scales: (() => {
      const x = {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'PP' },
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#475569' },
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }
      };
      const y: any = {
        beginAtZero: true,
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#475569' },
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' }
      };
      if (chartType === 'stacked') {
        y.stacked = true;
      }
      return { x, y };
    })()
  };
  return (
    <div style={{ height: 300 }} className="w-full">
      {chartType === 'bar' || chartType === 'stacked' ? (
        <Bar ref={chartRef} data={chartData as any} options={options} />
      ) : (
        <Line ref={chartRef} data={chartData as any} options={options} />
      )}
    </div>
  );
}
