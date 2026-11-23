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
import {CELL, CellInfo, CellStyle, PLATE, QRPlate, RADIUS} from './QRPlate';
import {Title} from './Title';
import {StatusPill} from './StatusPill';
import {clamp, COLORS, GLOW_MID, SCALE_MID} from './theme';

// Timeline lokal Scene 4 (0 = frame 930 global)
const T = {
  stain: 40, // noda muncul
  pillRed: 85,
  waveStart: 125, // gelombang cyan dari tepi
  waveEnd: 255, // sampai tengah
  ok: 258, // data utuh
};

const CENTER = PLATE / 2;
const DAMAGE_R = 186; // lingkaran r=186 px ≈ 25% luas grid QR

// Hash deterministik (tanpa Math.random)
const h = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const isDamaged = (r: number, c: number, d: number) =>
  d < DAMAGE_R + (h(r * 31 + c * 17 + 5) - 0.5) * 36;
const corruptDark = (r: number, c: number) => h(r * 53 + c * 7 + 3) > 0.5;

// Bentuk bercak organik
const BLOB_POINTS: [number, number][] = Array.from({length: 14}, (_, i) => {
  const ang = (i / 14) * Math.PI * 2;
  const rad = DAMAGE_R * (0.84 + 0.28 * h(i * 9 + 2));
  return [Math.cos(ang) * rad, Math.sin(ang) * rad];
});
const mid = (a: [number, number], b: [number, number]): [number, number] => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
];
const BLOB_PATH = (() => {
  const n = BLOB_POINTS.length;
  const m0 = mid(BLOB_POINTS[n - 1], BLOB_POINTS[0]);
  let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = BLOB_POINTS[i];
    const m = mid(p, BLOB_POINTS[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + ' Z';
})();
const DROPLETS = [
  {ang: 0.5, dist: 232, r: 16},
  {ang: 2.2, dist: 246, r: 22},
  {ang: 3.9, dist: 226, r: 12},
  {ang: 5.3, dist: 240, r: 18},
  {ang: 1.4, dist: 262, r: 9},
];

// Jari-jari gelombang: 520 (di luar plate) -> 0 (tengah)
const waveR = (f: number) =>
  interpolate(f, [T.waveStart, T.waveEnd], [520, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

/* ---------- Bercak merah transparan ---------- */
const Stain: React.FC<{R: number}> = ({R}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - T.stain),
    fps,
    config: {damping: 10, stiffness: 120, mass: 0.8},
  });
  // Noda hanya terlihat di dalam lingkaran gelombang -> terhapus dari tepi ke tengah
  const mask = `radial-gradient(circle at 50% 50%, #000 ${R - 28}px, transparent ${R}px)`;
  if (s <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: RADIUS,
        overflow: 'hidden',
        pointerEvents: 'none',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <svg width={PLATE} height={PLATE} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <filter id="stainBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g
          transform={`translate(${CENTER} ${CENTER}) scale(${s})`}
          filter="url(#stainBlur)"
          opacity={0.78 * Math.min(1, s * 2)}
        >
          <path d={BLOB_PATH} fill="rgba(239,68,68,0.62)" />
          {DROPLETS.map((d, i) => (
            <circle
              key={i}
              cx={Math.cos(d.ang) * d.dist}
              cy={Math.sin(d.ang) * d.dist}
              r={d.r}
              fill="rgba(239,68,68,0.62)"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

/* ---------- Gelombang pemindai cyan + ledakan hijau saat pulih ---------- */
const WaveRings: React.FC = () => {
  const frame = useCurrentFrame();
  const rings = [
    {lag: 0, w: 6, op: 1},
    {lag: 12, w: 3, op: 0.6},
  ];
  const burstT = interpolate(frame, [T.ok, T.ok + 32], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: RADIUS,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg width={PLATE} height={PLATE} style={{position: 'absolute', left: 0, top: 0}}>
        {rings.map(({lag, w, op}) => {
          if (frame - lag < T.waveStart) return null;
          const R = waveR(frame - lag);
          const vis = interpolate(R, [0, 30], [0, 1], clamp) * op;
          if (vis <= 0.001) return null;
          return (
            <g key={lag} opacity={vis}>
              <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth={w * 9} />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={R}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth={w}
                style={{filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.95))'}}
              />
            </g>
          );
        })}
        {burstT > 0 && burstT < 1 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={30 + 420 * burstT}
            fill="none"
            stroke={COLORS.green}
            strokeWidth={8}
            opacity={1 - burstT}
            style={{filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.9))'}}
          />
        )}
      </svg>
    </div>
  );
};

/* ---------- Scene 4 ---------- */
export const Scene4ReedSolomon: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = interpolate(frame, [0, 360], [SCALE_MID, 1.04], {
    ...clamp,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const glow = interpolate(
    frame,
    [0, 40, T.ok - 8, T.ok - 2, T.ok + 4, T.ok + 32],
    [GLOW_MID, 0.45, 0.45, 0.1, 0.1, 0.6],
    clamp
  );
  const glowColor = frame < T.ok ? '56,189,248' : '34,197,94';

  const R = waveR(frame);
  const endFade = interpolate(frame, [T.waveEnd, T.waveEnd + 25], [1, 0], clamp);

  const cellStyle = ({r, c, dark, cx, cy}: CellInfo): CellStyle | undefined => {
    const d = Math.hypot(cx - CENTER, cy - CENTER);
    const damaged = isDamaged(r, c, d);
    const tDamage = T.stain + 6 + (d / DAMAGE_R) * 12;
    // rusak sejak noda muncul, sampai gelombang melewati sel (R < d)
    const corrupt = damaged && frame >= tDamage && d <= R;
    const shownDark = corrupt ? corruptDark(r, c) : dark;
    const flash = R < d ? interpolate(d - R, [0, 70], [1, 0], clamp) * endFade : 0;

    if (flash > 0.001) {
      return {
        bg: shownDark
          ? interpolateColors(flash, [0, 1], [COLORS.bg, COLORS.cyanStrong])
          : interpolateColors(flash * 0.9, [0, 1], [COLORS.white, '#7DD3FC']),
      };
    }
    if (corrupt) return {bg: shownDark ? COLORS.bg : COLORS.white};
    return undefined;
  };

  const redIn = spring({
    frame: Math.max(0, frame - T.pillRed),
    fps,
    config: {damping: 14, stiffness: 140},
  });
  const swap = interpolate(frame, [T.ok - 6, T.ok + 4], [0, 1], clamp);
  const greenIn = spring({
    frame: Math.max(0, frame - T.ok),
    fps,
    config: {damping: 11, stiffness: 150, mass: 0.8},
  });

  return (
    <AbsoluteFill>
      <QRPlate
        tilt={0}
        scale={scale}
        opacity={1}
        glow={glow}
        glowColor={glowColor}
        cellStyle={cellStyle}
      >
        <Stain R={R} />
        <WaveRings />
      </QRPlate>

      <Title
        lines={[['KENA', 'NODA?'], ['TETAP', 'TERBACA']]}
        delay={8}
        fontSize={88}
        subtitle="Reed-Solomon Error Correction"
      />

      <StatusPill
        label="KERUSAKAN 25%"
        color={COLORS.red}
        icon="alert"
        visible={Math.min(redIn, 1 - swap)}
      />
      <StatusPill
        label="REED-SOLOMON: DATA UTUH"
        color={COLORS.green}
        icon="check"
        visible={greenIn}
      />
    </AbsoluteFill>
  );
};
