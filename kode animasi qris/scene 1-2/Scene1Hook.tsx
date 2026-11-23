import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {clamp, COLORS, FONTS, GLOW_END, SAFE, SCENE1, TILT_DEG} from './theme';
import {PLATE, QRPlate} from './QRPlate';

const LASER_START = 60;
const LASER_END = 130;

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // QR "terbalik" masuk lalu berhenti di kemiringan 35°
  const intro = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 90},
    durationInFrames: 45,
  });
  const tilt = interpolate(intro, [0, 1], [75, TILT_DEG]);
  const scale = interpolate(intro, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [0, 20], [0, 1], clamp);

  // Laser menyapu atas -> bawah (frame 60-130)
  const laserP = interpolate(frame, [LASER_START, LASER_END], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const laserY = laserP * PLATE;
  const laserOpacity = interpolate(
    frame,
    [LASER_START - 6, LASER_START, LASER_END, LASER_END + 10],
    [0, 1, 1, 0],
    clamp
  );
  const glow = interpolate(
    frame,
    [LASER_END, LASER_END + 12, LASER_END + 60],
    [0, 1, GLOW_END],
    clamp
  );

  // Badge hijau muncul tepat setelah laser selesai
  const badgeS = spring({
    frame: Math.max(0, frame - LASER_END),
    fps,
    config: {damping: 11, stiffness: 150, mass: 0.8},
  });
  const badgeOut = interpolate(frame, [190, 208], [1, 0], clamp);
  const checkP = interpolate(frame, [LASER_END + 6, LASER_END + 22], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <QRPlate
        tilt={tilt}
        scale={scale}
        opacity={opacity}
        glow={glow}
        laserY={laserY}
        laserOpacity={laserOpacity}
      />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          top: 1340,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, badgeS * 1.5) * badgeOut,
          transform: `translateY(${(1 - badgeS) * 60 + (1 - badgeOut) * 30}px) scale(${0.6 + 0.4 * badgeS})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '26px 48px 26px 34px',
            borderRadius: 999,
            background: COLORS.green,
            boxShadow: '0 0 50px rgba(34,197,94,0.45), 0 18px 40px rgba(0,0,0,0.4)',
          }}
        >
          <svg width={56} height={56} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={12} fill="rgba(11,15,25,0.16)" />
            <path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke={COLORS.bg}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={15}
              strokeDashoffset={(1 - checkP) * 15}
            />
          </svg>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 60,
              letterSpacing: 1,
              color: COLORS.bg,
              whiteSpace: 'nowrap',
            }}
          >
            100% TERBACA
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SCENE1_DURATION = SCENE1.duration;
