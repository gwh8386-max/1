import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {Cloud, H, MuzzleFlash, Puff, W, wavePath} from './common';

const s6 = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const};

/** Tàu khu trục nhìn ngang, mũi quay phải. Gốc toạ độ ở mặt nước giữa thân tàu. */
export const Destroyer: React.FC<{x: number; y: number; s?: number; fill?: string; lit?: boolean; flashes?: number[]; rock?: number}> = ({
  x,
  y,
  s = 1,
  fill = C.steel,
  lit = true,
  flashes = [],
  rock = 1,
}) => {
  const frame = useCurrentFrame();
  const roll = rock * 1.6 * Math.sin(frame / 22 + x);
  const heave = rock * 6 * Math.sin(frame / 17 + x);
  const flashK = (barrel: number) => {
    let best = -1;
    for (const f of flashes) {
      const k = (frame - f) / 9;
      if (k >= 0 && k <= 1 && (Math.round(f) % 2 === barrel || flashes.length === 1)) {
        best = k;
      }
    }
    return best;
  };
  const smokeK = (barrel: number) => {
    let best = -1;
    for (const f of flashes) {
      const k = (frame - f - 3) / 40;
      if (k >= 0 && k <= 1 && (Math.round(f) % 2 === barrel || flashes.length === 1)) {
        best = k;
      }
    }
    return best;
  };
  return (
    <g transform={`translate(${x} ${y + heave}) rotate(${roll}) scale(${s})`}>
      {/* thân */}
      <path d="M -380 0 L -360 -46 L 300 -52 L 400 -84 L 360 0 Z" fill={fill} {...s6} />
      <path d="M -370 -20 L 380 -26" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      {/* thượng tầng */}
      <path d="M -150 -50 L -150 -120 L 80 -120 L 80 -50 Z" fill={fill} {...s6} />
      <path d="M -40 -120 L -40 -178 L 70 -178 L 90 -120 Z" fill={fill} {...s6} />
      <rect x={-20} y={-168} width={84} height={18} fill={lit ? '#ffd56b' : '#22303c'} stroke={C.ink} strokeWidth={4} />
      {/* cột buồm */}
      <path d="M 20 -178 L 20 -320 M -20 -280 L 60 -280 M -6 -240 L 46 -240" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <circle cx={20} cy={-326} r={9} fill={lit ? '#ff6b5e' : C.ink} stroke={C.ink} strokeWidth={3} />
      {/* ống khói */}
      <path d="M -230 -50 L -220 -132 L -176 -132 L -170 -50 Z" fill={C.steelDark} {...s6} />
      <path d="M -120 -120 L -112 -190 L -70 -190 L -66 -120 Z" fill={C.steelDark} {...s6} />
      {/* tháp pháo */}
      <path d="M 170 -52 L 176 -92 L 250 -92 L 262 -52 Z" fill={fill} {...s6} />
      <path d="M 240 -80 L 330 -104" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <path d="M -320 -48 L -314 -86 L -246 -86 L -238 -48 Z" fill={fill} {...s6} />
      <path d="M -260 -76 L -200 -128" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      {/* cửa sổ */}
      {lit
        ? [-120, -80, -40, 0, 40].map((wx) => <circle key={wx} cx={wx} cy={-86} r={7} fill="#ffd56b" stroke={C.ink} strokeWidth={3} />)
        : null}
      <Puff x={350} y={-120} k={smokeK(0)} s={0.8} color="#59606a" />
      <Puff x={-190} y={-140} k={smokeK(1)} s={0.8} color="#59606a" />
      <MuzzleFlash x={345} y={-108} k={flashK(0)} angle={-15} />
      <MuzzleFlash x={-190} y={-138} k={flashK(1)} angle={-40} s={0.9} />
    </g>
  );
};

/** Tàu phóng lôi nhỏ, chạy sang phải, có vệt sóng phía sau. */
export const TorpedoBoat: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const frame = useCurrentFrame();
  const bounce = 5 * Math.sin(frame / 4 + x * 0.01);
  return (
    <g transform={`translate(${x} ${y + bounce}) scale(${s})`}>
      <path d="M -220 10 Q -120 -6 -40 10 Q -120 24 -220 10 Z" fill="#f4fbff" opacity={0.85} />
      <path d="M -140 0 L -132 -26 L 90 -30 L 140 -44 L 120 0 Z" fill="#6b7b6d" {...s6} />
      <path d="M -50 -28 L -44 -64 L 40 -64 L 52 -30 Z" fill="#7d8f80" {...s6} />
      <rect x={-30} y={-58} width={56} height={14} fill="#cfe7f2" stroke={C.ink} strokeWidth={3} />
      <path d="M -120 -24 L -60 -24" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M 130 -6 Q 170 -30 190 -4 Q 160 6 130 -6 Z" fill="#ffffff" stroke={C.ink} strokeWidth={3} />
    </g>
  );
};

/** Biển đêm có bão: trời, mây vần vũ, đường chân trời, các lớp sóng. */
export const NightSea: React.FC<{horizon?: number; flash?: number; children?: React.ReactNode; front?: React.ReactNode}> = ({
  horizon = 620,
  flash = 0,
  children,
  front,
}) => {
  const frame = useCurrentFrame();
  const ph = frame / 18;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060b14" />
          <stop offset="100%" stopColor="#1f3047" />
        </linearGradient>
        <linearGradient id="nsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2c44" />
          <stop offset="100%" stopColor="#081220" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#nsky)" />
      <rect width={W} height={H} fill="#cfe0ff" opacity={flash * 0.35} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cloud key={i} x={((i * 420 + frame * (0.6 + i * 0.15)) % (W + 600)) - 300} y={120 + (i % 3) * 90} s={1.6 + (i % 2) * 0.6} fill="#1b2433" stroke="#0a0f17" sw={6} />
      ))}
      <rect x={0} y={horizon} width={W} height={H - horizon} fill="url(#nsea)" />
      <path d={wavePath(horizon + 10, 6, 140, ph)} fill="#16263b" />
      {children}
      <path d={wavePath(horizon + 150, 18, 260, ph * 1.2)} fill="#13243a" stroke={C.ink} strokeWidth={4} />
      <path d={wavePath(horizon + 260, 28, 340, -ph * 1.4)} fill="#0e1c2f" stroke={C.ink} strokeWidth={5} />
      <path d={wavePath(horizon + 380, 40, 420, ph * 1.6, 0.5)} fill="#0a1626" stroke={C.ink} strokeWidth={6} />
      {/* bọt sóng */}
      {new Array(18).fill(0).map((_, i) => {
        const xx = ((random(`fx${i}`) * W + frame * 3) % (W + 100)) - 50;
        const yy = horizon + 160 + random(`fy${i}`) * 300;
        return <path key={i} d={`M ${xx} ${yy} q 20 -12 40 0`} stroke="#9fb6cc" strokeWidth={4} fill="none" opacity={0.5} />;
      })}
      {front}
    </svg>
  );
};

/** Biển ngày nắng (cảnh hồi tưởng). */
export const DaySea: React.FC<{horizon?: number; children?: React.ReactNode}> = ({horizon = 600, children}) => {
  const frame = useCurrentFrame();
  const ph = frame / 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fc2e6" />
          <stop offset="100%" stopColor="#d9f0f7" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#dsky)" />
      <circle cx={1620} cy={170} r={80} fill="#fff4c2" stroke={C.ink} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <Cloud key={i} x={((i * 560 + frame * 0.5) % (W + 500)) - 250} y={140 + (i % 2) * 110} s={1.1 + (i % 2) * 0.4} />
      ))}
      <rect x={0} y={horizon} width={W} height={H - horizon} fill={C.daySea} />
      <path d={wavePath(horizon + 6, 4, 120, ph)} fill="#3d82ad" />
      {children}
      <path d={wavePath(horizon + 200, 14, 260, ph * 1.3)} fill="#2a6690" stroke={C.ink} strokeWidth={4} />
      <path d={wavePath(horizon + 330, 22, 360, -ph * 1.2)} fill="#225a80" stroke={C.ink} strokeWidth={5} />
      {new Array(26).fill(0).map((_, i) => {
        const xx = ((random(`dx${i}`) * W + frame * 2) % (W + 100)) - 50;
        const yy = horizon + 40 + random(`dy${i}`) * 400;
        return <path key={i} d={`M ${xx} ${yy} l 24 0`} stroke="#e8f7ff" strokeWidth={4} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(frame / 5 + i)} />;
      })}
    </svg>
  );
};

/** Vệt đạn vạch đường bay vào bóng tối. */
export const Tracer: React.FC<{x0: number; y0: number; x1: number; y1: number; at: number; dur?: number}> = ({x0, y0, x1, y1, at, dur = 16}) => {
  const frame = useCurrentFrame();
  const k = (frame - at) / dur;
  if (k < 0 || k > 1) {
    return null;
  }
  const a = Math.max(0, k - 0.25);
  const xa = x0 + (x1 - x0) * a;
  const ya = y0 + (y1 - y0) * a - Math.sin(a * Math.PI) * 80;
  const xb = x0 + (x1 - x0) * k;
  const yb = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 80;
  return <line x1={xa} y1={ya} x2={xb} y2={yb} stroke="#ffd27a" strokeWidth={6} strokeLinecap="round" opacity={1 - k * 0.5} />;
};
