import React from 'react';

interface CircularFlagProps {
  assetKey: string;
  size?: number; // width & height in px
  className?: string;
}

export const CircularFlag: React.FC<CircularFlagProps> = ({ assetKey, size = 36, className = '' }) => {
  const key = assetKey.toLowerCase();

  if (key === 'usd') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <defs>
          <clipPath id="usdFlagClip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#usdFlagClip)">
          <rect width="100" height="100" fill="#FFFFFF" />
          <rect y="0" width="100" height="7.69" fill="#B22234" />
          <rect y="15.38" width="100" height="7.69" fill="#B22234" />
          <rect y="30.77" width="100" height="7.69" fill="#B22234" />
          <rect y="46.15" width="100" height="7.69" fill="#B22234" />
          <rect y="61.54" width="100" height="7.69" fill="#B22234" />
          <rect y="76.92" width="100" height="7.69" fill="#B22234" />
          <rect y="92.31" width="100" height="7.69" fill="#B22234" />
          <rect width="45" height="53.85" fill="#3C3B6E" />
          <g fill="#FFFFFF">
            <circle cx="8" cy="8" r="2.2" />
            <circle cx="17" cy="8" r="2.2" />
            <circle cx="26" cy="8" r="2.2" />
            <circle cx="35" cy="8" r="2.2" />
            <circle cx="12.5" cy="16" r="2.2" />
            <circle cx="21.5" cy="16" r="2.2" />
            <circle cx="30.5" cy="16" r="2.2" />
            <circle cx="8" cy="24" r="2.2" />
            <circle cx="17" cy="24" r="2.2" />
            <circle cx="26" cy="24" r="2.2" />
            <circle cx="35" cy="24" r="2.2" />
            <circle cx="12.5" cy="32" r="2.2" />
            <circle cx="21.5" cy="32" r="2.2" />
            <circle cx="30.5" cy="32" r="2.2" />
            <circle cx="8" cy="40" r="2.2" />
            <circle cx="17" cy="40" r="2.2" />
            <circle cx="26" cy="40" r="2.2" />
            <circle cx="35" cy="40" r="2.2" />
            <circle cx="12.5" cy="48" r="2.2" />
            <circle cx="21.5" cy="48" r="2.2" />
            <circle cx="30.5" cy="48" r="2.2" />
          </g>
        </g>
      </svg>
    );
  }

  if (key === 'eur') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <defs>
          <clipPath id="eurFlagClip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#eurFlagClip)">
          <rect width="100" height="100" fill="#003399" />
          <g fill="#FFCC00">
            <polygon points="50,14 51.5,18.5 56,18.5 52.5,21.5 54,26 50,23 46,26 47.5,21.5 44,18.5 48.5,18.5" />
            <polygon points="50,74 51.5,78.5 56,78.5 52.5,81.5 54,86 50,83 46,86 47.5,81.5 44,78.5 48.5,78.5" />
            <polygon points="20,44 21.5,48.5 26,48.5 22.5,51.5 24,56 20,53 16,56 17.5,51.5 14,48.5 18.5,48.5" />
            <polygon points="80,44 81.5,48.5 86,48.5 82.5,51.5 84,56 80,53 76,56 77.5,51.5 74,48.5 78.5,48.5" />
            <polygon points="29,23 30.5,27.5 35,27.5 31.5,30.5 33,35 29,32 25,35 26.5,30.5 23,27.5 27.5,27.5" />
            <polygon points="71,23 72.5,27.5 77,27.5 73.5,30.5 75,35 71,32 67,35 68.5,30.5 65,27.5 69.5,27.5" />
            <polygon points="29,65 30.5,69.5 35,69.5 31.5,72.5 33,77 29,74 25,77 26.5,72.5 23,69.5 27.5,69.5" />
            <polygon points="71,65 72.5,69.5 77,69.5 73.5,72.5 75,77 71,74 67,77 68.5,72.5 65,69.5 69.5,69.5" />
          </g>
        </g>
      </svg>
    );
  }

  if (key === 'aed') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <defs>
          <clipPath id="aedFlagClip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#aedFlagClip)">
          <rect y="0" width="100" height="33.33" fill="#00732F" />
          <rect y="33.33" width="100" height="33.34" fill="#FFFFFF" />
          <rect y="66.67" width="100" height="33.33" fill="#000000" />
          <rect x="0" y="0" width="28" height="100" fill="#FF0000" />
        </g>
      </svg>
    );
  }

  if (key === 'gbp') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <defs>
          <clipPath id="gbpFlagClip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#gbpFlagClip)">
          <rect width="100" height="100" fill="#012169" />
          <polygon points="0,0 12,0 100,88 100,100 88,100 0,12" fill="#FFFFFF" />
          <polygon points="100,0 88,0 0,88 0,100 12,100 100,12" fill="#FFFFFF" />
          <polygon points="0,0 6,0 100,94 100,100 94,100 0,6" fill="#C8102E" />
          <polygon points="100,0 94,0 0,94 0,100 6,100 100,6" fill="#C8102E" />
          <rect x="40" width="20" height="100" fill="#FFFFFF" />
          <rect y="40" width="100" height="20" fill="#FFFFFF" />
          <rect x="44" width="12" height="100" fill="#C8102E" />
          <rect y="44" width="100" height="12" fill="#C8102E" />
        </g>
      </svg>
    );
  }

  if (key === 'usdt') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <circle cx="50" cy="50" r="50" fill="#26A17B" />
        <path
          d="M50,22c-15.5,0 -28,3.5 -28,8s12.5,8 28,8s28,-3.5 28,-8s-12.5,-8 -28,-8zm0,11.5c-11,0 -20,-2 -20,-3.5s9,-3.5 20,-3.5s20,2 20,3.5s-9,3.5 -20,3.5z"
          fill="#FFFFFF"
        />
        <path
          d="M55,39v18.5c10.8,-0.6 19,-3.6 19,-7.2s-8.2,-6.6 -19,-7.2V39h13v-5H32v5h13v4.1C34.2,43.7 26,46.7 26,50.3s8.2,6.6 19,7.2V78h10V57.5c10.8,-0.6 19,-3.6 19,-7.2s-8.2,-6.6 -19,-7.2V39z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (key === 'btc') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <circle cx="50" cy="50" r="50" fill="#F7931A" />
        <path
          d="M68,43c1,-5.5 -3.5,-8.5 -9.5,-10.5l2,-7.8l-4.7,-1.2l-1.9,7.6c-1.2,-0.3 -2.5,-0.6 -3.8,-0.9l1.9,-7.7l-4.7,-1.2l-2,7.9c-1,-0.2 -2.1,-0.5 -3.1,-0.7l0,-0.1l-6.5,-1.6l-1.3,5l3.5,0.9c1.9,0.5 2.2,1.6 2.1,2.5l-2.1,8.6c0.1,0 0.3,0.1 0.4,0.1l-0.4,-0.1l-3,11.9c-0.3,0.6 -0.9,1.5 -2.4,1.1l-3.5,-0.9l-2.4,5.5l6.1,1.5c1.1,0.3 2.3,0.6 3.5,0.8l-2,8.1l4.7,1.2l2,-7.9c1.3,0.3 2.5,0.7 3.8,1l-2,7.9l4.7,1.2l2,-8.1c8.1,1.5 14.1,0.9 16.7,-6.4c2.1,-5.9 -0.1,-9.3 -4.3,-11.5c3.1,-0.7 5.4,-2.7 6,-6.9zm-10.7,15c-1.5,5.9 -11.4,2.7 -14.6,1.9l2.6,-10.4c3.2,0.8 13.5,2.4 12,8.5zm1.5,-15.1c-1.3,5.4 -9.6,2.7 -12.3,2l2.4,-9.5c2.7,0.7 11.3,1.9 9.9,7.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (key === 'gold18k') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 rounded-full shadow-sm ${className}`}
      >
        <defs>
          <linearGradient id="goldGrad18" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#goldGrad18)" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.5" />
        <text x="50" y="59" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" fill="#78350F" textAnchor="middle">
          18K
        </text>
      </svg>
    );
  }

  // Coin assets (emami, bahar, half, quarter, gerami)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 rounded-full shadow-sm ${className}`}
    >
      <defs>
        <linearGradient id="coinGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#coinGradReact)" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="#F59E0B" fillOpacity="0.3" />
      <text x="50" y="59" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" fill="#78350F" textAnchor="middle">
        سکه
      </text>
    </svg>
  );
};
