
import React from 'react';

export const THEME_COLORS = {
  blue: '#0082CA',
  yellow: '#FBB03B',
  green: '#7AC943',
  purple: '#A362D9',
  red: '#F15A24',
  orange: '#F7931E'
};

export const TMCLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 400 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simplified abstract representation of the provided TMC logo */}
    <path d="M200 50 C280 50, 350 120, 350 200 C350 280, 280 350, 200 350 C120 350, 50 280, 50 200 C50 120, 120 50, 200 50" stroke={THEME_COLORS.blue} strokeWidth="20" fill="none" />
    <path d="M150 100 Q200 150, 250 100" stroke={THEME_COLORS.yellow} strokeWidth="15" fill="none" />
    <path d="M100 200 Q150 250, 100 300" stroke={THEME_COLORS.green} strokeWidth="15" fill="none" />
    <path d="M300 200 Q250 250, 300 300" stroke={THEME_COLORS.purple} strokeWidth="15" fill="none" />
    <circle cx="200" cy="200" r="20" fill={THEME_COLORS.red} />
    <circle cx="280" cy="120" r="10" fill={THEME_COLORS.orange} />
    <circle cx="120" cy="120" r="10" fill={THEME_COLORS.blue} />
  </svg>
);
