import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CELL, PAD, PLATE, QRPlate} from './QRPlate';
import {FINDERS, isFinder} from './qrData';
import {SCENE2_TITLE, Title} from './Title';
import {Legend} from './Scene2Binary';
import {StatusPill} from './StatusPill';
import {clamp, COLORS, FONTS, GLOW_MID, HEIGHT, SCALE_MID, WIDTH} from './theme';

// Timeline lokal Scene 3 (0 = frame 540 global)
const T = {
  finderStart: [40, 56, 72], // outline TL, TR, BL
  tagsOut: 112, // label hilang sebelum QR berputar (tetap di area aman)
  spinStart: 125,
  spinDur: 70,
  axesStart: 205,
  lockStart: 250,
  exitStart: 345,
};

// Geometri sumbu: origin = pusat finder kiri atas, ujung sedikit di luar plate
const O = PAD + 2.5 * CELL; // 146
const END = PLATE + 14; // 746
const S = SCALE_MID;
const sx = (v: number) => WIDTH / 2 + (v - PLATE / 2) * S;
const sy = (v: number) => HEIGHT / 2 + (v - PLATE / 2) * S;

/* ---------- Outline finder + label (di dalam koordinat plate) ---------- */
const FinderLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);
  const fade = interpolate(frame, [T.exitStart, T.exitStart + 40], [1, 0], clamp);
  const tagFade = interpolate(frame, [T.tagsOut, T.tagsOut + 12], [1, 0], clamp);

  return (
    <>
      <svg
        width={PLATE}
        height={PLATE}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fade}}
      >
        {FINDERS.map((f, i) => {
          const p = spring({
            frame: Math.max(0, frame - T.finderStart[i]),
            fps,
            config: {damping: 200},
            durationInFrames: 26,
          });
          const x = PAD + f.c * CELL - 8;
          const y = PAD + f.r * CELL - 8;
          const size = 5 * CELL + 16;
          const perim = 4 * size;
          const cx = PAD + (f.c + 2.5) * CELL;
          const top = f.r === 0;
          return (
            <g key={i}>
              {/* garis penghubung ke label */}
              <line
                x1={cx}
                x2={cx}
                y1={top ? -14 : PLATE + 14}
                y2={top ? y : y + size}
                stroke={COLORS.cyan}
                strokeWidth={3}
                opacity={0.7 * p}
              />
              <rect
                x={x}
                y={y}
                width={size}
                height={size}
                rx={14}
                fill={`rgba(56,189,248,${0.12 * p})`}
                stroke={COLORS.cyan}
                strokeWidth={6}
                strokeLinejoin="round"
                strokeDasharray={perim}
                strokeDashoffset={(1 - p) * perim}
                style={{filter: `drop-shadow(0 0 ${8 + 8 * pulse}px rgba(56,189,248,0.95))`}}
              />
            </g>
          );
        })}
      </svg>

      {FINDERS.map((f, i) => {
        const ts = spring({
          frame: Math.max(0, frame - (T.finderStart[i] + 10)),
          fps,
          config: {damping: 14, stiffness: 150},
        });
        const cx = PAD + (f.c + 2.5) * CELL;
        const cy = f.r === 0 ? -42 : PLATE + 42;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * ts})`,
              opacity: Math.min(1, ts * 1.5) * tagFade,
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(11,15,25,0.92)',
              border: `2px solid ${COLORS.cyan}`,
              boxShadow: '0 0 22px rgba(56,189,248,0.55)',
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 1.5,
              color: COLORS.cyan,
              whiteSpace: 'nowrap',
            }}
          >
            FINDER PATTERN
          </div>
        );
      })}
    </>
  );
};

/* ---------- Sumbu X/Y milik QR (ikut berputar bersama QR) ---------- */
const AxesAttached: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ax = spring({
    frame: Math.max(0, frame - T.axesStart),
    fps,
    config: {damping: 200},
    durationInFrames: 30,
  });
  const lockC = interpolate(frame, [258, 270], [0, 1], clamp);
  const color = interpolateColors(lockC, [0, 1], [COLORS.cyan, COLORS.green]);
  const fade = interpolate(frame, [T.exitStart, T.exitStart + 30], [1, 0], clamp);
  const pulseT = interpolate(frame, [262, 292], [0, 1], clamp);
  const len = (END - O) * ax;
  if (ax <= 0.001) return null;

  return (
    <svg
      width={PLATE}
      height={PLATE}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fade}}
    >
      <g style={{filter: `drop-shadow(0 0 10px ${color})`}}>
        <line x1={O} y1={O} x2={O + len} y2={O} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <line x1={O} y1={O} x2={O} y2={O + len} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <g opacity={Math.min(1, ax * 6)}>
          <polygon
            points={`${O + len + 16},${O} ${O + len - 8},${O - 14} ${O + len - 8},${O + 14}`}
            fill={color}
          />
          <polygon
            points={`${O},${O + len + 16} ${O - 14},${O + len - 8} ${O + 14},${O + len - 8}`}
            fill={color}
          />
        </g>
        <circle cx={O} cy={O} r={13} fill={color} />
      </g>
      {pulseT > 0 && pulseT < 1 && (
        <circle
          cx={O}
          cy={O}
          r={14 + 110 * pulseT}
          fill="none"
          stroke={COLORS.green}
          strokeWidth={6}
          opacity={1 - pulseT}
        />
      )}
    </svg>
  );
};

/* ---------- Sumbu acuan tetap di layar (target tegak) ---------- */
const GhostAxes: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [196, 210], [0, 1], clamp);
  const lines = appear * interpolate(frame, [268, 285], [1, 0], clamp);
  const labels = appear * interpolate(frame, [T.exitStart, T.exitStart + 30], [1, 0], clamp);
  const lockC = interpolate(frame, [258, 270], [0, 1], clamp);
  const labelColor = interpolateColors(lockC, [0, 1], [COLORS.white, COLORS.green]);

  const x0 = sx(O);
  const y0 = sy(O);
  const x1 = sx(END);
  const y1 = sy(END);
  const a = 16 * S;
  const stroke = 'rgba(248,250,252,0.6)';
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    fontFamily: FONTS.mono,
    fontWeight: 800,
    fontSize: 40,
    color: labelColor,
    opacity: labels,
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', left: 0, top: 0, opacity: lines}}>
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={stroke} strokeWidth={4} strokeDasharray="14 12" />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={stroke} strokeWidth={4} strokeDasharray="14 12" />
        <polygon points={`${x1 + a},${y0} ${x1 - a / 2},${y0 - a * 0.9} ${x1 - a / 2},${y0 + a * 0.9}`} fill={stroke} />
        <polygon points={`${x0},${y1 + a} ${x0 - a * 0.9},${y1 - a / 2} ${x0 + a * 0.9},${y1 - a / 2}`} fill={stroke} />
      </svg>
      <div style={{...labelStyle, left: x1 + 34, top: y0}}>X</div>
      <div style={{...labelStyle, left: x0, top: y1 + 36}}>Y</div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 3 ---------- */
export const Scene3FinderPattern: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Zoom-out dari Scene 2 ke skala bersama
  const scale = interpolate(frame, [0, 45], [1.14, SCALE_MID], {
    ...clamp,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const glow = interpolate(
    frame,
    [0, 45, T.exitStart, T.exitStart + 40],
    [0.2, 0.35, 0.35, GLOW_MID],
    clamp
  );

  // Putar 180° (miring 3D), lalu "kunci" kembali tegak dengan snap
  const spin = spring({
    frame: Math.max(0, frame - T.spinStart),
    fps,
    config: {damping: 20, stiffness: 70},
    durationInFrames: T.spinDur,
  });
  const lock = spring({
    frame: Math.max(0, frame - T.lockStart),
    fps,
    config: {damping: 13, stiffness: 110, mass: 0.9},
  });
  const arc = (v: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, v)));
  const rotate = 180 * spin + 180 * lock; // 0 -> 180 -> 360
  const tilt = 28 * arc(spin) + 16 * arc(lock);

  // Spotlight: redupkan sel selain finder pattern
  const spot = interpolate(frame, [36, 64, T.exitStart, T.exitStart + 40], [0, 1, 1, 0], clamp);
  const cellStyle = ({r, c}: {r: number; c: number}) =>
    isFinder(r, c) ? undefined : {opacity: 1 - 0.72 * spot};

  // Status
  const exit = interpolate(frame, [T.exitStart, T.exitStart + 30], [1, 0], clamp);
  const redIn = spring({
    frame: Math.max(0, frame - 215),
    fps,
    config: {damping: 14, stiffness: 140},
  });
  const swap = interpolate(frame, [262, 270], [0, 1], clamp);
  const greenIn = spring({
    frame: Math.max(0, frame - 268),
    fps,
    config: {damping: 11, stiffness: 150, mass: 0.8},
  });
  const legendOut = 1 - interpolate(frame, [0, 12], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <QRPlate
        tilt={tilt}
        rotate={rotate}
        scale={scale}
        opacity={1}
        glow={glow}
        revertFrame={frame < 70 ? frame : undefined}
        cellStyle={cellStyle}
      >
        <FinderLayer />
        <AxesAttached />
      </QRPlate>

      <GhostAxes />

      {/* Judul scene 2 keluar, judul scene 3 masuk */}
      {frame < 16 && <Title lines={SCENE2_TITLE} delay={-100} exitAt={0} exitDuration={14} />}
      {frame < 14 && <Legend progress={legendOut} />}
      <Title
        lines={[['DIBACA', 'DARI'], ['ARAH', 'MANAPUN']]}
        delay={16}
        fontSize={92}
        subtitle="Tiga finder pattern di sudut QR"
        exitAt={T.exitStart}
        exitDuration={25}
      />

      <StatusPill
        label="ORIENTASI TERBALIK"
        color={COLORS.red}
        icon="alert"
        visible={Math.min(redIn, 1 - swap) * exit}
      />
      <StatusPill
        label="ORIENTASI TERKUNCI"
        color={COLORS.green}
        icon="check"
        visible={greenIn * exit}
      />
    </AbsoluteFill>
  );
};
