import React from 'react';
import {random} from 'remotion';
import {C} from '../lib/theme';

export const W = 1920;
export const H = 1080;

export const ink = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** Đường sóng khép kín xuống đáy khung. */
export const wavePath = (y: number, amp: number, len: number, phase: number, chop = 0.35, width = W + 200) => {
  let d = `M -100 ${H + 50} L -100 ${y}`;
  for (let x = -100; x <= width; x += 16) {
    const k = (x / len) * Math.PI * 2 + phase;
    const yy = y + amp * (Math.sin(k) + chop * Math.sin(2.3 * k + 1.7 * phase));
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return `${d} L ${width} ${H + 50} Z`;
};

export const Stars: React.FC<{n?: number; seed?: string; maxY?: number; frame: number}> = ({n = 80, seed = 's', maxY = 500, frame}) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const tw = 0.5 + 0.5 * Math.sin(frame / 9 + i * 1.7);
      return <circle key={i} cx={random(`${seed}x${i}`) * W} cy={random(`${seed}y${i}`) * maxY} r={1 + random(`${seed}r${i}`) * 1.8} fill="#fff" opacity={0.25 + 0.6 * tw} />;
    })}
  </g>
);

/** Mây bồng bềnh: các hình tròn chồng nhau, trôi theo frame. */
export const Cloud: React.FC<{x: number; y: number; s?: number; fill?: string; stroke?: string; sw?: number}> = ({x, y, s = 1, fill = '#fff', stroke = C.ink, sw = 5}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M -120 30 Q -150 30 -150 0 Q -150 -34 -110 -32 Q -100 -70 -54 -64 Q -30 -100 16 -86 Q 56 -110 84 -70 Q 140 -74 140 -24 Q 168 -10 150 22 Q 140 34 110 30 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  </g>
);

export const Rivets: React.FC<{x: number; y: number; w: number; h: number; gap?: number}> = ({x, y, w, h, gap = 60}) => {
  const pts: [number, number][] = [];
  for (let i = x + 20; i < x + w - 10; i += gap) {
    pts.push([i, y + 16], [i, y + h - 16]);
  }
  return (
    <g>
      {pts.map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={4.5} fill="#8e9aa6" stroke={C.ink} strokeWidth={2} />
      ))}
    </g>
  );
};

export const Glow: React.FC<{id: string; sd?: number}> = ({id, sd = 6}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={sd} result="b" />
    <feMerge>
      <feMergeNode in="b" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

/** Loé đầu nòng: ngôi sao nhọn + quầng sáng, k từ 0 (vừa bắn) tới 1 (tắt). */
export const MuzzleFlash: React.FC<{x: number; y: number; k: number; s?: number; angle?: number}> = ({x, y, k, s = 1, angle = 0}) => {
  if (k < 0 || k > 1) {
    return null;
  }
  const r = (1 - k) * 90 * s;
  const pts = new Array(14)
    .fill(0)
    .map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const rr = i % 2 === 0 ? r : r * 0.42;
      return `${(Math.cos(a) * rr * 1.6).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
    })
    .join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={1 - k * 0.6}>
      <circle r={r * 2.4} fill="#ffcf6a" opacity={0.35 * (1 - k)} />
      <polygon points={pts} fill="#fff1b8" stroke="#ff9b2e" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** Cụm khói tan dần (k: 0 -> 1). */
export const Puff: React.FC<{x: number; y: number; k: number; s?: number; color?: string}> = ({x, y, k, s = 1, color = '#3a3f46'}) => {
  if (k < 0 || k > 1) {
    return null;
  }
  const r = (30 + 90 * Math.sqrt(k)) * s;
  return (
    <g opacity={(1 - k) * 0.9} transform={`translate(${x} ${y - k * 60 * s})`}>
      <circle cx={-r * 0.5} cy={0} r={r * 0.7} fill={color} stroke={C.ink} strokeWidth={4} />
      <circle cx={r * 0.4} cy={-r * 0.2} r={r * 0.8} fill={color} stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={-r * 0.6} r={r * 0.6} fill={color} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
