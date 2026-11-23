import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, COLORS, FONTS, SAFE} from './theme';

export const SCENE2_TITLE = [['BAHASA', 'BINER'], ['DI', 'BALIK', 'QR']];

type Props = {
  lines: string[][];
  delay?: number; // frame mulai (negatif = langsung tampil penuh)
  fontSize?: number;
  subtitle?: string;
  exitAt?: number; // frame mulai menghilang
  exitDuration?: number;
};

export const Title: React.FC<Props> = ({
  lines,
  delay = 10,
  fontSize = 96,
  subtitle,
  exitAt,
  exitDuration = 16,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + exitDuration], [0, 1], clamp);
  const barW = spring({
    frame: Math.max(0, frame - (delay + 18)),
    fps,
    config: {damping: 200},
    durationInFrames: 30,
  });
  const subS = spring({
    frame: Math.max(0, frame - (delay + 30)),
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  let wordIndex = 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: SAFE.top + 60,
        left: SAFE.left,
        right: SAFE.right,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: 1 - exit,
        transform: `translateY(${-exit * 40}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{display: 'flex', gap: 24, justifyContent: 'center'}}>
          {line.map((word) => {
            const i = wordIndex++;
            const s = spring({
              frame: Math.max(0, frame - (delay + i * 4)),
              fps,
              config: {damping: 16, stiffness: 140},
            });
            return (
              <span
                key={`${li}-${word}`}
                style={{
                  display: 'inline-block',
                  fontFamily: FONTS.sans,
                  fontWeight: 800,
                  fontSize,
                  lineHeight: 1.08,
                  letterSpacing: -1,
                  color: COLORS.white,
                  whiteSpace: 'nowrap',
                  opacity: Math.min(1, s * 1.6),
                  transform: `translateY(${(1 - s) * 50}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
      <div
        style={{
          marginTop: 36,
          height: 8,
          width: 180 * barW,
          borderRadius: 4,
          background: COLORS.cyan,
          boxShadow: '0 0 20px rgba(56,189,248,0.7)',
        }}
      />
      {subtitle && (
        <div
          style={{
            marginTop: 28,
            fontFamily: FONTS.mono,
            fontWeight: 600,
            fontSize: 30,
            color: COLORS.soft,
            opacity: subS,
            transform: `translateY(${(1 - subS) * 16}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
