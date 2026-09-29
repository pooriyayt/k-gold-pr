import React from 'react';

interface WaveChartProps {
  color?: 'green' | 'blue' | 'yellow' | 'red';
  width?: number;
  height?: number;
}

export const WaveChart: React.FC<WaveChartProps> = ({
  color = 'green',
  width = 75,
  height = 24,
}) => {
  const strokeMap = {
    green: '#10B981',
    blue: '#38BDF8',
    yellow: '#F5A524',
    red: '#EF4444',
  };

  const stroke = strokeMap[color];
  const id = `wave-grad-${color}-${Math.random().toString(36).substring(2, 7)}`;

  // Smooth bezier curve points
  return (
    <svg width={width} height={height} viewBox="0 0 80 26" fill="none" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M 2,18 C 15,22 25,12 40,16 C 55,20 65,6 78,4"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 2,18 C 15,22 25,12 40,16 C 55,20 65,6 78,4 L 78,26 L 2,26 Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
};
