import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, TOTAL_FRAMES} from './theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, TOTAL_FRAMES], [0, -120]);
  const mask = 'radial-gradient(circle at 50% 50%, #000 15%, transparent 72%)';

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 75% 42% at 50% 50%, rgba(56,189,248,0.14), transparent 70%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(248,250,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundPosition: `0px ${drift}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </AbsoluteFill>
  );
};
