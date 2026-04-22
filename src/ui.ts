// ─────────────────────────────────────────────────────────────────────────────
// skilld brand animation
//
// Animated braille noise field used as the CLI loader and intended as a
// reference for porting the effect to the skilld.dev website (canvas/WebGL).
//
// ── Visual structure ─────────────────────────────────────────────────────────
//
// The animation is a 10×3 grid of Unicode Braille characters (U+2800 block).
// Row 1 (middle) is split: 2 chars noise | ⏶ skilld | 2 chars noise | version.
// The rose chevron mark (⏶ in #fb7185) sits inline next to the wordmark.
//
//   ⣿⡿⣷⣾⣽⣻⢿⡷⣯⣟
//   ⣷⣾ ⏶ skilld ⢿⡷ v1.5.5
//   ⡿⣷⣾⣽⣻⢿⡷⣯⣟⡾
//
// ── Color system ─────────────────────────────────────────────────────────────
//
// Each project gets a deterministic hue seeded from `cwd` via djb2 hash.
// This means the noise field is a different color per project while staying
// consistent across runs. Saturation and lightness scale with brightness
// so dim pixels are muted and bright pixels are vivid.
//
// Brand mark color: #fb7185 (rose-400, rgb 251 113 133)
//
// To port to web: seed the hue from the page URL or user session instead
// of cwd. Use HSL directly in CSS/canvas rather than the manual conversion.
//
// ── Noise characters ─────────────────────────────────────────────────────────
//
// NOISE_CHARS is a curated set of Braille characters with varying dot
// densities. At low brightness, a random sparse character is picked.
// At high density (approaching 1), all pixels converge to ⣿ (all 8 dots).
// Below a brightness threshold of 0.08, the cell is empty (space).
//
// For web: map this to opacity/scale of a dot grid, particle field, or
// canvas noise. The density parameter controls the fill ratio.
//
// ── Brightness / ripple model ────────────────────────────────────────────────
//
// `brightness(x, y)` computes per-cell brightness as the sum of 3 expanding
// rings radiating outward from the grid center (cx=5, cy=1).
//
// Each ring:
//   1. Starts at a staggered time offset (ring * 0.5s apart)
//   2. Expands outward: `front = elapsed * 4` (speed in cells/sec)
//   3. Brightness falls off as a Gaussian of distance from the ring front,
//      multiplied by an exponential time decay so older rings fade.
//
// After ~1.5s a low ambient "base" fades in with random jitter, filling
// the grid with a subtle shimmer once the initial ripples pass.
//
// For web: use requestAnimationFrame with the same math. The `t` parameter
// is seconds since animation start. Ring count, speed, and decay constants
// are tunable. Y coordinates are scaled by 3× because terminal cells are
// taller than wide; on a square pixel grid remove the `* 3` factor.
//
// ── Animation phases ─────────────────────────────────────────────────────────
//
// 1. **Ripple** (main loop): rings expand from center, status text below.
//    Runs at ~16fps (60ms interval) until the async work completes
//    (minimum 1.5s so the animation is always visible).
//
// 2. **Fill outro** (500ms): `floor` and `density` ramp from 0→1 with a
//    quadratic ease-in. Floor raises the minimum brightness so all cells
//    light up; density drives characters toward ⣿ (fully filled).
//    Creates a satisfying "solidify" effect as the loader finishes.
//
// 3. **Final frame**: frozen at full density (floor=0.9, density=1).
//    `logUpdate.done()` prints this frame permanently and clears the
//    updatable region.
//
// For web: map floor → minimum opacity, density → blur reduction or
// particle consolidation. The eased ramp `p * p` gives a natural feel.
//
// ── Key constants ────────────────────────────────────────────────────────────
//
// NOISE_CHARS  Braille glyphs sorted roughly by visual weight
// BRAND_MARK   Rose chevron ⏶ in #fb7185, the skilld logo mark
// BRAND_HUE    Per-project hue in [0,1], seeded from cwd
// cx=5, cy=1   Ripple origin (grid center)
// ring count=3 Number of concentric expanding rings
// ring gap=0.5 Seconds between ring starts
// ring speed=4 Cells per second expansion rate
// base onset   Ambient shimmer starts after 1.5s
// outroMs=500  Duration of the fill-in outro
// minMs=1500   Minimum animation duration before work result shows
// ─────────────────────────────────────────────────────────────────────────────

import logUpdate from 'log-update'
import { version } from './version.ts'

// Braille glyphs with varying dot densities, from dense to sparse
const NOISE_CHARS = '⣿⡿⣷⣾⣽⣻⢿⡷⣯⣟⡾⣵⣳⢾⡽⣞⡷⣝⢯'

// djb2 string hash, used to seed a stable per-project hue from cwd
function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++)
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

// Manual HSL→RGB, one channel at a time (no dependencies)
function hueToChannel(p: number, q: number, t: number): number {
  const t1 = t < 0 ? t + 1 : t > 1 ? t - 1 : t
  if (t1 < 1 / 6)
    return p + (q - p) * 6 * t1
  if (t1 < 1 / 2)
    return q
  if (t1 < 2 / 3)
    return p + (q - p) * (2 / 3 - t1) * 6
  return p
}

// Returns [r, g, b] each 0–255. h in [0,1], s/l in [0,1].
function hsl(h: number, s: number, l: number): [number, number, number] {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hueToChannel(p, q, h + 1 / 3) * 255),
    Math.round(hueToChannel(p, q, h) * 255),
    Math.round(hueToChannel(p, q, h - 1 / 3) * 255),
  ]
}

// Per-project hue: hash cwd → map to [0,1] hue range
const BRAND_HUE = (djb2(process.cwd()) % 360) / 360

// Render a single braille noise cell with ANSI truecolor.
// brightness [0,1] controls lightness; density [0,1] biases toward ⣿.
// Below 0.08 brightness the cell is blank (space).
function noiseChar(brightness: number, density = 0): string {
  if (brightness < 0.08)
    return ' '
  const b = Math.min(brightness, 1)
  const ch = Math.random() < density ? '⣿' : NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]
  // Saturation and lightness both scale with brightness so dim = muted, bright = vivid
  const [r, g, bl] = hsl(BRAND_HUE, 0.4 + b * 0.15, 0.35 + b * 0.25)
  return `\x1B[38;2;${r};${g};${bl}m${ch}`
}

// Render a horizontal row of noise cells, each with brightness from `brightnessFn(x)`
function noiseLine(len: number, brightnessFn: (x: number) => number, density = 0): string {
  let s = ''
  for (let i = 0; i < len; i++)
    s += noiseChar(brightnessFn(i), density)
  return `${s}\x1B[0m`
}

// Rose chevron mark from the skilld.dev logo: ⏶ in #fb7185
const BRAND_MARK = '\x1B[38;2;251;113;133m⏶\x1B[0m'

// Compose a single animation frame.
// t = seconds elapsed, floor = minimum brightness, density = fill bias.
// Returns a 3-line string with %NAME% and %VER% placeholders.
export function brandFrame(t: number, floor = 0, density = 0): string {
  const cx = 5 // ripple origin x (grid center)
  const cy = 1 // ripple origin y (middle row)

  // Per-cell brightness: sum of 3 expanding ring wavefronts + ambient base
  const brightness = (x: number, y: number) => {
    // Distance from ripple center; y scaled 3× because terminal cells are ~3:1 aspect
    const d = Math.sqrt((x - cx) ** 2 + ((y - cy) * 3) ** 2)
    let val = 0
    for (let ring = 0; ring < 3; ring++) {
      const rt = t - ring * 0.5 // staggered start: each ring 0.5s after the last
      if (rt <= 0)
        continue
      const front = rt * 4 // ring expands at 4 cells/sec
      const proximity = Math.abs(d - front)
      // Gaussian falloff from ring front × exponential time decay
      val += Math.exp(-proximity * proximity * 0.8) * Math.exp(-rt * 0.4)
    }
    // After 1.5s, fade in low ambient shimmer with random jitter
    const base = Math.max(0, (t - 1.5) * 0.3) * (Math.random() * 0.3 + 0.1)
    return Math.min(1, Math.max(floor, val + base))
  }

  return [
    noiseLine(10, x => brightness(x, 0), density),
    `${noiseLine(2, x => brightness(x, 1), density)} ${BRAND_MARK} %NAME% ${noiseLine(2, x => brightness(x + 8, 1), density)} %VER%`,
    noiseLine(10, x => brightness(x, 2), density),
  ].join('\n')
}

// Run an async task with the brand animation as a loader.
// The animation plays for at least `minMs` so it's always visible.
// Set SKILLD_EFFECT=none to skip the animation entirely.
export async function brandLoader<T>(work: () => Promise<T>, minMs = 1500): Promise<T> {
  if (process.env.SKILLD_EFFECT === 'none')
    return work()

  const name = '\x1B[1m\x1B[38;2;255;255;255mskilld\x1B[0m'
  const verStr = `\x1B[2mv${version}\x1B[0m`
  const status = '\x1B[2mSetting up your environment\x1B[0m'
  const start = Date.now()

  const sub = (raw: string) => raw.replace('%NAME%', name).replace('%VER%', verStr)

  let done = false
  const result = Promise.all([
    work(),
    new Promise<void>(r => setTimeout(r, minMs)),
  ]).then(([v]) => {
    done = true
    return v
  })

  // Phase 1: Ripple — rings expand from center at ~16fps
  // eslint-disable-next-line no-unmodified-loop-condition -- modified async in .then()
  while (!done) {
    const t = (Date.now() - start) / 1000
    logUpdate(`\n  ${sub(brandFrame(t))}\n\n  ${status}`)
    await new Promise(r => setTimeout(r, 60))
  }

  // Phase 2: Fill outro — floor and density ramp up with quadratic ease
  const outroMs = 500
  const outroStart = Date.now()
  const tFinal = (outroStart - start) / 1000
  while (Date.now() - outroStart < outroMs) {
    const p = (Date.now() - outroStart) / outroMs
    const eased = p * p // quadratic ease-in: slow start, fast finish
    logUpdate(`\n  ${sub(brandFrame(tFinal + p * 0.5, eased * 0.9, eased))}\n`)
    await new Promise(r => setTimeout(r, 40))
  }

  // Phase 3: Final frozen frame at full density
  logUpdate(`\n  ${sub(brandFrame(tFinal + 1, 0.9, 1))}\n`)
  logUpdate.done()
  return result
}
