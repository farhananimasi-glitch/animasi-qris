import React from 'react';
import {COLORS, FONTS, SAFE} from './theme';

type Props = {
  label: string;
  color: string; // hex, mis. COLORS.green
  icon: 'check' | 'alert';
  visible: number; // 0..1 (boleh overshoot)
};

export const StatusPill: React.FC<Props> = ({label, color, icon, visible}) => {
  if (visible <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        right: SAFE.right,
        bottom: SAFE.bottom + 140,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(1, visible * 1.5),
        transform: `translateY(${(1 - visible) * 50}px) scale(${0.7 + 0.3 * visible})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '22px 44px 22px 26px',
          borderRadius: 999,
          background: 'rgba(11,15,25,0.92)',
          border: `3px solid ${color}`,
          boxShadow: `0 0 44px ${color}66, 0 18px 40px rgba(0,0,0,0.45)`,
        }}
      >
        <svg width={56} height={56} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={12} fill={color} />
          {icon === 'check' ? (
            <path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke={COLORS.bg}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <path
                d="M12 6.5v7"
                stroke={COLORS.bg}
                strokeWidth={2.6}
                strokeLinecap="round"
              />
              <circle cx={12} cy={17.3} r={1.6} fill={COLORS.bg} />
            </>
          )}
        </svg>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: 0.5,
            color: COLORS.white,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
