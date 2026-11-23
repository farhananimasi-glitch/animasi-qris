export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  bg: '#0B0F19',
  panel: '#0F172A',
  cyan: '#38BDF8',
  cyanStrong: '#0EA5E9',
  white: '#F8FAFC',
  green: '#22C55E',
  dim: '#64748B',
  soft: '#CBD5E1',
  red: '#EF4444',
};

// Area aman untuk UI TikTok / Reels (px)
export const SAFE = {top: 120, bottom: 120, left: 120, right: 120};

export const FONTS = {
  sans: `Inter, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
  mono: `"JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`,
};

// Timeline (tambahkan scene berikutnya di sini)
export const SCENE1 = {from: 0, duration: 210};
export const SCENE2 = {from: 210, duration: 330};
export const SCENE3 = {from: 540, duration: 390};
export const SCENE4 = {from: 930, duration: 360};
export const SCENE5 = {from: 1290, duration: 360};
export const SCENE6 = {from: 1650, duration: 150};
export const TOTAL_FRAMES = SCENE6.from + SCENE6.duration; // 1800

// Nilai yang harus sama di akhir Scene 1 & awal Scene 2 (transisi mulus)
export const TILT_DEG = 35;
export const GLOW_END = 0.45;

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// Skala & glow QR yang dipakai bersama di Scene 3 & 4 (transisi mulus)
export const SCALE_MID = 0.96;
export const GLOW_MID = 0.25;

// Warna ikon bank & e-wallet (Scene 5) - juga dipakai sebagai strip pada label QRIS
export const PAY_COLORS = ['#3B82F6', '#F97316', '#A855F7', '#EC4899', '#FACC15'];
