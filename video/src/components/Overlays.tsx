import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

/** Vân giấy + hạt nhiễu nhẹ, cho cảm giác tranh vẽ tay. Seed đổi mỗi 3 frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 3) % 6;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity}}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.55, color = '0,0,0'}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)`,
    }}
  />
);

/** Mưa xiên: các vạch rơi, xác định theo frame (render lại vẫn giống hệt). */
export const Rain: React.FC<{count?: number; angle?: number; speed?: number; opacity?: number; color?: string}> = ({
  count = 140,
  angle = 14,
  speed = 2200,
  opacity = 0.5,
  color = '#cfe3ff',
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const dx = Math.tan((angle * Math.PI) / 180);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`rx${i}`) * (width + 400) - 200;
        const v = speed * (0.7 + 0.6 * random(`rv${i}`));
        const len = 30 + 40 * random(`rl${i}`);
        const y = ((random(`ry${i}`) * height + t * v) % (height + 200)) - 100;
        const x = x0 - (y + 100) * dx;
        return <line key={i} x1={x} y1={y} x2={x - len * dx} y2={y - len} stroke={color} strokeWidth={2.2} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Chớp trắng nhanh (sét, nổ). */
export const FlashAt: React.FC<{at: number[]; color?: string; max?: number; dur?: number}> = ({at, color = '#e8f1ff', max = 0.85, dur = 10}) => {
  const frame = useCurrentFrame();
  let v = 0;
  for (const a of at) {
    if (frame >= a && frame < a + dur) {
      const k = (frame - a) / dur;
      // sét có hai nhịp loé
      v = Math.max(v, max * (k < 0.25 ? 1 : k < 0.4 ? 0.3 : 0.8 * (1 - k)));
    }
  }
  if (v <= 0) {
    return null;
  }
  return <AbsoluteFill style={{background: color, opacity: v, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

/** Giới hạn giá trị nội suy kèm clamp, viết gọn. */
export const lerp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
