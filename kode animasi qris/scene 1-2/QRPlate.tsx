import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useVideoConfig,
} from 'remotion';
import {clamp, COLORS, FONTS} from './theme';
import {QR_MATRIX, QR_SIZE} from './qrData';

export const CELL = 44;
export const PAD = 36;
export const GRID_PX = QR_SIZE * CELL; // 660
export const PLATE = GRID_PX + PAD * 2; // 732
export const RADIUS = 40;

// Timing konversi biner (frame lokal Scene 2)
export const BIN = {start: 60, span: 190, jitter: 0.5};
// Timing kembali dari angka ke kotak (frame lokal Scene 3)
export const REVERT = {span: 40};

export type CellInfo = {r: number; c: number; dark: boolean; cx: number; cy: number};
export type CellStyle = {bg?: string; opacity?: number};

type Props = {
  tilt: number; // kemiringan 3D (derajat)
  scale: number;
  opacity: number;
  glow: number; // 0..1
  glowColor?: string; // "r,g,b"
  rotate?: number; // putaran bidang (derajat)
  laserY?: number;
  laserOpacity?: number;
  binFrame?: number; // kotak -> angka (Scene 2)
  revertFrame?: number; // angka -> kotak (Scene 3)
  cellStyle?: (info: CellInfo) => CellStyle | undefined; // override per sel
  children?: React.ReactNode; // overlay dalam koordinat plate (0..PLATE)
};

export const QRPlate: React.FC<Props> = ({
  tilt,
  scale,
  opacity,
  glow,
  glowColor = '56,189,248',
  rotate = 0,
  laserY,
  laserOpacity = 0,
  binFrame,
  revertFrame,
  cellStyle,
  children,
}) => {
  const {fps} = useVideoConfig();

  let plateBg: string = COLORS.white;
  if (binFrame !== undefined) {
    const wipeX = interpolate(
      binFrame,
      [BIN.start - 10, BIN.start, BIN.start + BIN.span, BIN.start + BIN.span + 10],
      [0, PAD, PAD + GRID_PX, PLATE],
      clamp
    );
    plateBg = `linear-gradient(90deg, ${COLORS.panel} ${wipeX}px, ${COLORS.white} ${wipeX}px)`;
  } else if (revertFrame !== undefined) {
    const wipeX = interpolate(revertFrame, [0, REVERT.span + 10], [0, PLATE], clamp);
    plateBg = `linear-gradient(90deg, ${COLORS.white} ${wipeX}px, ${COLORS.panel} ${wipeX}px)`;
  }

  const cells: React.ReactNode[] = [];
  QR_MATRIX.forEach((row, r) => {
    row.forEach((dark, c) => {
      const cx = PAD + (c + 0.5) * CELL;
      const cy = PAD + (r + 0.5) * CELL;
      let bg: string = dark ? COLORS.bg : COLORS.white;
      let digit: React.ReactNode = null;

      // Kotak hitam berpendar saat disapu laser (Scene 1)
      if (laserY !== undefined && dark) {
        const flash =
          interpolate(laserY - cy, [-20, 0, 100], [0, 1, 0], clamp) * laserOpacity;
        bg = interpolateColors(flash, [0, 1], [COLORS.bg, COLORS.cyanStrong]);
      }

      // Konversi kotak <-> angka
      let convP: number | null = null;
      let convS = 0;
      if (binFrame !== undefined) {
        const start = BIN.start + (c / QR_SIZE) * BIN.span + r * BIN.jitter;
        const s = spring({
          frame: Math.max(0, binFrame - start),
          fps,
          config: {damping: 14, stiffness: 170, mass: 0.7},
          durationInFrames: 22,
        });
        convS = s;
        convP = Math.min(1, s);
      } else if (revertFrame !== undefined) {
        const start = (c / QR_SIZE) * REVERT.span + r * 0.3;
        const s = spring({
          frame: Math.max(0, revertFrame - start),
          fps,
          config: {damping: 200},
          durationInFrames: 18,
        });
        convS = 1 - s;
        convP = 1 - Math.min(1, s);
      }
      if (convP !== null) {
        bg = interpolateColors(
          convP,
          [0, 1],
          dark
            ? ['rgba(11,15,25,1)', 'rgba(56,189,248,0.10)']
            : ['rgba(248,250,252,1)', 'rgba(15,23,42,0)']
        );
        if (convP > 0.002) {
          digit = (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: CELL * 0.7,
                lineHeight: 1,
                color: dark ? COLORS.cyan : COLORS.dim,
                opacity: dark ? convP : convP * 0.6,
                transform: `scale(${0.5 + 0.5 * convS})`,
                textShadow: dark ? '0 0 14px rgba(56,189,248,0.7)' : 'none',
              }}
            >
              {dark ? '1' : '0'}
            </span>
          );
        }
      }

      // Override dari scene (spotlight, kerusakan, perbaikan, dst.)
      const ov = cellStyle?.({r, c, dark, cx, cy});
      if (ov?.bg) bg = ov.bg;

      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: CELL,
            height: CELL,
            background: bg,
            opacity: ov?.opacity ?? 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {digit}
        </div>
      );
    });
  });

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          position: 'relative',
          width: PLATE,
          height: PLATE,
          borderRadius: RADIUS,
          background: plateBg,
          opacity,
          transform: `perspective(1800px) rotateX(${tilt}deg) rotateZ(${rotate - tilt * 0.5}deg) scale(${scale})`,
          boxShadow: [
            `0 0 0 2px rgba(${glowColor},${0.12 + 0.6 * glow})`,
            `0 0 ${70 * glow}px rgba(${glowColor},${0.55 * glow})`,
            '0 40px 90px rgba(0,0,0,0.55)',
          ].join(', '),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD,
            display: 'grid',
            gridTemplateColumns: `repeat(${QR_SIZE}, ${CELL}px)`,
          }}
        >
          {cells}
        </div>

        {laserY !== undefined && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: RADIUS,
                overflow: 'hidden',
                opacity: laserOpacity,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: laserY - 200,
                  height: 200,
                  background:
                    'linear-gradient(to bottom, rgba(56,189,248,0) 0%, rgba(56,189,248,0.38) 100%)',
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: -48,
                right: -48,
                top: laserY - 3,
                height: 6,
                borderRadius: 3,
                background: COLORS.cyan,
                opacity: laserOpacity,
                boxShadow:
                  '0 0 18px 4px rgba(56,189,248,0.9), 0 0 60px 14px rgba(56,189,248,0.45)',
              }}
            />
          </>
        )}

        {children}
      </div>
    </AbsoluteFill>
  );
};
