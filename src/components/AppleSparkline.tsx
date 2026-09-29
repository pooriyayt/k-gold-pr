import React from 'react';

interface AppleSparklineProps {
  id: string;
  color: string;
  isUp?: boolean;
  width?: number;
  height?: number;
}

export const AppleSparkline: React.FC<AppleSparklineProps> = ({
  id,
  color,
  isUp = true,
  width = 68,
  height = 24,
}) => {
  const pts = isUp
    ? [
        [0, 22],
        [18, 19],
        [35, 15],
        [52, 10],
        [70, 6],
      ]
    : [
        [0, 6],
        [18, 10],
        [35, 15],
        [52, 19],
        [70, 22],
      ];

  const pathD = 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ');
  const areaD = `${pathD} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 70 ${height}`}
      fill="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`spark_grad_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark_grad_${id})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
