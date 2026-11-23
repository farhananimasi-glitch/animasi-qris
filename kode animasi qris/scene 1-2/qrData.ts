// Matriks QR ilustratif 15x15 (true = kotak hitam = "1", false = putih = "0").
// Deterministik (seeded) -> aman untuk rendering Remotion, tanpa Math.random().
export const QR_SIZE = 15;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tiga finder pattern 5x5 + separator (kotak 6x6)
const CORNERS = [
  {r0: 0, c0: 0, fr: 0, fc: 0},
  {r0: 0, c0: 9, fr: 0, fc: 10},
  {r0: 9, c0: 0, fr: 10, fc: 0},
];

function structural(r: number, c: number): boolean | null {
  for (const {r0, c0, fr, fc} of CORNERS) {
    if (r >= r0 && r < r0 + 6 && c >= c0 && c < c0 + 6) {
      const dr = r - fr;
      const dc = c - fc;
      if (dr >= 0 && dr < 5 && dc >= 0 && dc < 5) {
        const ring = Math.max(Math.abs(dr - 2), Math.abs(dc - 2));
        return ring !== 1; // luar hitam, tengah putih, inti hitam
      }
      return false; // separator putih
    }
  }
  // Alignment pattern kecil 3x3 di kanan bawah
  if (r >= 10 && r <= 12 && c >= 10 && c <= 12) {
    return !(r === 11 && c === 11);
  }
  return null;
}

const rand = mulberry32(2024);

export const QR_MATRIX: boolean[][] = Array.from({length: QR_SIZE}, (_, r) =>
  Array.from({length: QR_SIZE}, (_, c) => {
    const s = structural(r, c);
    const v = rand();
    return s !== null ? s : v > 0.5;
  })
);

// Posisi finder pattern (kiri atas, kanan atas, kiri bawah), ukuran 5x5 sel
export const FINDERS = [
  {r: 0, c: 0},
  {r: 0, c: 10},
  {r: 10, c: 0},
];

export const isFinder = (r: number, c: number): boolean =>
  FINDERS.some((f) => r >= f.r && r < f.r + 5 && c >= f.c && c < f.c + 5);
