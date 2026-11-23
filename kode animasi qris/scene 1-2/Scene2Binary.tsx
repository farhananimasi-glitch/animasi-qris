import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {clamp, COLORS, FONTS, GLOW_END, SAFE, SCENE2, TILT_DEG} from './theme';
import {QRPlate} from './QRPlate';
import {SCENE2_TITLE, Title} from './Title';

const LegendChip: React.FC<{digit: string; label: string; color: string; dim?: boolean}> = ({
  digit,
  label,
  color,
  dim,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: 34,
        color,
        opacity: dim ? 0.7 : 1,
      }}
    >
      {digit}
    </div>
    <span style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: 38, color: COLORS.soft}}>
      {label}
    </span>
  </div>
);

// Diekspor agar Scene 3 bisa menampilkannya sekilas saat transisi keluar
export const Legend: React.FC<{progress: number}> = ({progress}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.left,
      right: SAFE.right,
      bottom: SAFE.bottom + 40,
      display: 'flex',
      justifyContent: 'center',
      gap: 56,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 24}px)`,
    }}
  >
    <LegendChip digit="1" label="kotak hitam" color={COLORS.cyan} />
    <LegendChip digit="0" label="kotak putih" color={COLORS.dim} dim />
  </div>
);

export const Scene2Binary: React.FC = () => {
  const frame = useCurrentFrame(); // frame lokal (0 = frame 210 global)
  const {fps} = useVideoConfig();

  const settle = spring({frame, fps, config: {damping: 200}, durationInFrames: 60});
  const tilt = TILT_DEG * (1 - settle);

  const scale = interpolate(frame, [0, SCENE2.duration], [1, 1.14], {
    ...clamp,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const glow = interpolate(frame, [0, 60], [GLOW_END, 0.2], clamp);

  const legendS = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  return (
    <AbsoluteFill>
      <QRPlate tilt={tilt} scale={scale} opacity={1} glow={glow} binFrame={frame} />
      <Title lines={SCENE2_TITLE} delay={10} />
      <Legend progress={legendS} />
    </AbsoluteFill>
  );
};
