"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

type Point = { label: string; value: number };

export default function MockLineChart({ data, height = 160 }: { data: Point[]; height?: number }) {
  const { theme } = useTheme();
  const width = 600;
  const padding = 16;

  const values = data.map(d => d.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);

  const xStep = (width - padding * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * xStep;
    const y = padding + (1 - (d.value - min) / (max - min)) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${points[0].x.toFixed(2)} ${height - padding} Z`;

  const stroke = theme === 'dark' ? 'var(--accent-secondary)' : 'var(--accent-primary)';
  const areaFill = theme === 'dark' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const labelColor = theme === 'dark' ? '#cbd5e1' : '#475569';

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={padding}
            x2={width - padding}
            y1={padding + t * (height - padding * 2)}
            y2={padding + t * (height - padding * 2)}
            stroke={gridColor}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}

        {/* area */}
        <path d={areaD} fill={areaFill} />

        {/* line */}
        <path d={pathD} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={stroke} stroke={theme === 'dark' ? '#0f172a' : '#ffffff'} strokeWidth={1} />
        ))}

        {/* labels */}
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={height - 4} fill={labelColor} fontSize={10} textAnchor="middle">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
