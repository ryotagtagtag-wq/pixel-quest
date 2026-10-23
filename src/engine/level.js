// Level geometry is intentionally data-only so it is easy to remix or extend.
export const WORLD = { width: 2860, height: 270, floorY: 244 };

// Every solid is an axis-aligned rectangle: x, y, width, height.
export const SOLIDS = [
  { x: 0, y: 244, w: 780, h: 26, kind: 'ground' },
  { x: 850, y: 244, w: 580, h: 26, kind: 'ground' },
  { x: 1510, y: 244, w: 690, h: 26, kind: 'ground' },
  { x: 2280, y: 244, w: 580, h: 26, kind: 'ground' },
  { x: 188, y: 198, w: 74, h: 9, kind: 'platform' },
  { x: 324, y: 166, w: 78, h: 9, kind: 'platform' },
  { x: 465, y: 190, w: 78, h: 9, kind: 'platform' },
  { x: 602, y: 157, w: 83, h: 9, kind: 'platform' },
  { x: 900, y: 202, w: 84, h: 9, kind: 'platform' },
  { x: 1030, y: 175, w: 78, h: 9, kind: 'platform' },
  { x: 1169, y: 145, w: 88, h: 9, kind: 'platform' },
  { x: 1330, y: 194, w: 65, h: 9, kind: 'platform' },
  { x: 1580, y: 198, w: 78, h: 9, kind: 'platform' },
  { x: 1715, y: 166, w: 78, h: 9, kind: 'platform' },
  { x: 1850, y: 135, w: 78, h: 9, kind: 'platform' },
  { x: 1990, y: 180, w: 80, h: 9, kind: 'platform' },
  { x: 2350, y: 205, w: 80, h: 9, kind: 'platform' },
  { x: 2470, y: 180, w: 76, h: 9, kind: 'platform' },
];

export const COINS = [
  [215, 176], [352, 144], [493, 168], [628, 135], [700, 218],
  [924, 178], [1054, 151], [1198, 121], [1360, 170],
  [1605, 174], [1742, 142], [1878, 111], [2020, 156], [2142, 218],
  [2375, 181], [2496, 156], [2665, 218],
].map(([x, y], id) => ({ id, x, y, taken: false }));

export const ENEMY_SPAWNS = [
  { x: 390, min: 350, max: 470, speed: 24 },
  { x: 690, min: 640, max: 740, speed: 28 },
  { x: 950, min: 880, max: 1010, speed: 25 },
  { x: 1370, min: 1300, max: 1410, speed: 29 },
  { x: 1638, min: 1550, max: 1690, speed: 27 },
  { x: 2110, min: 2040, max: 2165, speed: 32 },
  { x: 2390, min: 2310, max: 2440, speed: 28 },
];

export const SPIKES = [
  { x: 530, y: 232, w: 24, h: 12 },
  { x: 1085, y: 232, w: 24, h: 12 },
  { x: 1810, y: 232, w: 24, h: 12 },
  { x: 2180, y: 232, w: 24, h: 12 },
];

export const CHECKPOINTS = [
  { x: 1220, label: 'RUINS' },
  { x: 2040, label: 'BOSS GATE' },
];

export const BOSS_START = { x: 2550, min: 2490, max: 2630, y: 206, w: 34, h: 38, hp: 5 };
