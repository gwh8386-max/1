import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C, STROKE} from '../lib/theme';
import {H, W} from './common';

// Bối cảnh mùa đông (Chiến tranh Mùa đông 1939–40). Khổ 1920x1080.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const SNOW = {sky: '#c9d3dc', skyLow: '#e6ebef', ground: '#f3f6f8', shade: '#d5dee7', far: '#9fb0be', mid: '#5f7383', near: '#2f4150', trunk: '#4a3a2c'};

/** Cây thông phủ tuyết: chồng 4 tầng tam giác, mép tuyết trắng. */
export const Pine: React.FC<{x: number; y: number; h: number; fill?: string; stroke?: boolean; snow?: boolean}> = ({x, y, h, fill = SNOW.mid, stroke = true, snow = true}) => {
  const w = h * 0.42;
  const tiers = [0, 1, 2, 3];
  const sw = stroke ? Math.max(2, h / 90) : 0;
  return (
    <g>
      <rect x={x - h * 0.025} y={y - h * 0.12} width={h * 0.05} height={h * 0.14} fill={SNOW.trunk} stroke={stroke ? C.ink : 'none'} strokeWidth={sw} />
      {tiers.map((i) => {
        const top = y - h + i * h * 0.2;
        const bot = top + h * 0.38;
        const ww = w * (0.45 + i * 0.2);
        return (
          <g key={i}>
            <path d={`M ${x} ${top} L ${x + ww} ${bot} Q ${x} ${bot - h * 0.05} ${x - ww} ${bot} Z`} fill={fill} stroke={stroke ? C.ink : 'none'} strokeWidth={sw} strokeLinejoin="round" />
            {snow ? <path d={`M ${x - ww * 0.82} ${bot - h * 0.03} Q ${x} ${bot - h * 0.1} ${x + ww * 0.82} ${bot - h * 0.03} Q ${x} ${bot - h * 0.06} ${x - ww * 0.82} ${bot - h * 0.03} Z`} fill="#ffffff" opacity={0.9} /> : null}
          </g>
        );
      })}
      {snow ? <path d={`M ${x - w * 0.18} ${y - h + h * 0.12} L ${x} ${y - h} L ${x + w * 0.18} ${y - h + h * 0.12} Z`} fill="#ffffff" /> : null}
    </g>
  );
};

/** Tuyết rơi chéo nhẹ (lớp trên cùng của cảnh). */
export const Snowfall: React.FC<{count?: number; opacity?: number; wind?: number; seed?: string; speed?: number}> = ({count = 120, opacity = 0.9, wind = 0.6, seed = 'sn', speed = 1}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const z = 0.4 + random(`${seed}z${i}`) * 0.9;
        const vy = (1.2 + 2.2 * z) * speed;
        const y = (random(`${seed}y${i}`) * (H + 40) + frame * vy) % (H + 40) - 20;
        const x = (random(`${seed}x${i}`) * (W + 200) + frame * vy * wind + 30 * Math.sin(frame / 30 + i)) % (W + 200) - 100;
        return <circle key={i} cx={x} cy={y} r={1.6 + 3.4 * z} fill="#ffffff" opacity={0.55 + 0.4 * z} />;
      })}
    </svg>
  );
};

/** Rừng tuyết nhiều lớp: trời xám, hàng cây xa nhạt, hàng cây giữa, mặt tuyết, cây gần đậm. */
export const SnowForest: React.FC<{
  seed?: string;
  horizon?: number;
  children?: React.ReactNode;
  front?: React.ReactNode;
  snow?: number;
  dim?: number;
  nearTrees?: boolean;
}> = ({seed = 'f', horizon = 640, children, front, snow = 110, dim = 0, nearTrees = true}) => {
  const far = new Array(26).fill(0).map((_, i) => ({x: (i / 25) * (W + 120) - 60 + (random(`${seed}fx${i}`) - 0.5) * 50, h: 180 + random(`${seed}fh${i}`) * 120}));
  const mid = new Array(13).fill(0).map((_, i) => ({x: (i / 12) * (W + 200) - 100 + (random(`${seed}mx${i}`) - 0.5) * 90, h: 300 + random(`${seed}mh${i}`) * 170}));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id={`${seed}sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SNOW.sky} />
            <stop offset="1" stopColor={SNOW.skyLow} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${seed}sky)`} />
        <circle cx={W * 0.72} cy={190} r={70} fill="#f6f1e2" opacity={0.6} />
        {far.map((t, i) => (
          <Pine key={`f${i}`} x={t.x} y={horizon - 10} h={t.h} fill={SNOW.far} stroke={false} snow={false} />
        ))}
        <path d={`M 0 ${horizon - 20} Q ${W * 0.3} ${horizon - 50} ${W * 0.55} ${horizon - 18} T ${W} ${horizon - 30} L ${W} ${H} L 0 ${H} Z`} fill={SNOW.shade} />
        {mid.map((t, i) => (
          <Pine key={`m${i}`} x={t.x} y={horizon + 20 + (i % 3) * 14} h={t.h} fill={SNOW.mid} />
        ))}
        <path d={`M 0 ${horizon + 40} Q ${W * 0.25} ${horizon + 10} ${W * 0.5} ${horizon + 46} T ${W} ${horizon + 30} L ${W} ${H} L 0 ${H} Z`} fill={SNOW.ground} stroke={C.ink} strokeWidth={5} />
        {new Array(9).fill(0).map((_, i) => (
          <path key={`d${i}`} d={`M ${random(`${seed}dx${i}`) * W} ${horizon + 90 + random(`${seed}dy${i}`) * 300} q 60 -14 130 0`} fill="none" stroke={SNOW.shade} strokeWidth={6} strokeLinecap="round" />
        ))}
      </svg>
      {children}
      {nearTrees ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <Pine x={-30} y={H + 60} h={1000} fill={SNOW.near} />
          <Pine x={W + 40} y={H + 80} h={940} fill={SNOW.near} />
        </svg>
      ) : null}
      {front}
      <Snowfall count={snow} seed={`${seed}s`} />
      {dim > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(20,30,45,${dim})`}} /> : null}
    </div>
  );
};

/** Súng trường nhìn ngang (Mosin-Nagant). Gốc toạ độ ở báng súng, nòng hướng sang phải. */
export const Rifle: React.FC<{x: number; y: number; s?: number; rot?: number; scope?: boolean; glint?: number; frost?: number}> = ({x, y, s = 1, rot = 0, scope = false, glint = 0, frost = 0}) => {
  const st = {stroke: C.ink, strokeWidth: 5 / Math.max(0.6, s), strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M 0 -6 L 60 -22 L 300 -18 L 520 -14 L 530 4 L 300 6 L 150 12 L 70 40 L 0 30 Z" fill="#8a5a32" {...st} />
      <rect x={300} y={-26} width={460} height={14} rx={4} fill="#3b3f45" {...st} />
      <rect x={740} y={-30} width={22} height={10} fill="#3b3f45" {...st} />
      <path d="M 270 -26 L 290 -44 L 300 -44 L 290 -24" fill="#3b3f45" {...st} />
      <path d="M 250 -24 L 236 -6" stroke={C.ink} strokeWidth={8 / s} strokeLinecap="round" />
      {scope ? (
        <g>
          <rect x={210} y={-74} width={210} height={30} rx={12} fill="#2a2d31" {...st} />
          <rect x={196} y={-80} width={30} height={42} rx={8} fill="#2a2d31" {...st} />
          <rect x={404} y={-82} width={34} height={46} rx={8} fill="#2a2d31" {...st} />
          <path d="M 250 -44 L 250 -26 M 380 -44 L 380 -26" stroke={C.ink} strokeWidth={8 / s} />
          {glint > 0 ? (
            <g transform="translate(438 -59)" opacity={glint}>
              <circle r={26 + 30 * glint} fill="#fff6c8" opacity={0.7} />
              <path d="M -90 0 L 90 0 M 0 -90 L 0 90 M -50 -50 L 50 50 M -50 50 L 50 -50" stroke="#fffbe6" strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null}
          {frost > 0 ? <rect x={404} y={-82} width={34} height={46} rx={8} fill="#e8f4ff" opacity={0.85 * frost} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** Xạ thủ nằm sấp trong tuyết, nhìn sang phải, áp má vào súng. Gốc ở hông. */
export const ProneSniper: React.FC<{x: number; y: number; s?: number; fire?: number[]; hit?: number; blinkSeed?: number}> = ({x, y, s = 1, fire = [], hit, blinkSeed = 3}) => {
  const frame = useCurrentFrame();
  const period = 110;
  const ph = (frame + blinkSeed * 37) % period;
  const blink = ph < 3 ? 0.15 : 1;
  const hitK = hit !== undefined ? interpolate(frame, [hit, hit + 6], [0, 1], clamp) : 0;
  const recoil = fire.reduce((a, f) => a + (frame >= f && frame < f + 8 ? (1 - (frame - f) / 8) * 10 : 0), 0);
  const st = {stroke: C.ink, strokeWidth: STROKE, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${-8 * hitK})`}>
      {/* chân và thân */}
      <path d="M -380 10 Q -300 -20 -150 -24 Q 0 -40 90 -34 Q 150 -30 170 0 Q 60 20 -120 18 Q -300 26 -380 22 Z" fill="#f4f6f8" {...st} />
      <path d="M -330 4 Q -240 -6 -170 -8 M -60 -24 Q 0 -30 60 -24" fill="none" stroke="#b8c3ce" strokeWidth={4} />
      {/* bờ tuyết trước mặt */}
      <path d="M 120 30 Q 210 -40 330 -20 Q 400 -6 430 30 Z" fill="#ffffff" {...st} />
      {/* súng */}
      <g transform={`translate(${-recoil} 0)`}>
        <Rifle x={60} y={-56} s={0.62} rot={-1} />
        {fire.map((f) =>
          frame >= f && frame < f + 4 ? (
            <g key={f} transform="translate(538 -74)">
              <circle r={34} fill="#fff1a8" opacity={0.9} />
              <path d="M 0 0 L 60 -10 L 30 6 L 64 14 Z" fill="#ffd34a" />
            </g>
          ) : null,
        )}
      </g>
      {/* tay đỡ súng */}
      <path d="M 40 -20 Q 110 -30 170 -46" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <circle cx={172} cy={-48} r={12} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      {/* đầu trong mũ trùm, áp má vào báng súng */}
      <g transform={`translate(120 -84) rotate(${8 + 30 * hitK})`}>
        <circle r={50} fill="#f4f6f8" {...st} />
        <path d="M 8 -36 Q 44 -34 50 -4 L 60 4 L 50 10 Q 46 34 14 38 Q 2 10 8 -36 Z" fill={C.skin} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        {hitK < 0.5 ? (
          <g transform={`translate(32 -8) scale(1 ${blink})`}>
            <ellipse rx={6} ry={8} fill={C.ink} />
            <circle cx={2} cy={-3} r={2} fill="#fff" />
          </g>
        ) : (
          <path d="M 26 -14 L 40 -2 M 40 -14 L 26 -2" stroke={C.ink} strokeWidth={4} />
        )}
        <path d="M 20 -24 L 42 -24" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Xe trượt tuyết gỗ có người nằm (được kéo đi). Gốc ở giữa đáy. */
export const Sled: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const st = {stroke: C.ink, strokeWidth: 5, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -170 0 L 150 0 Q 190 0 196 -26" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <rect x={-160} y={-40} width={300} height={22} rx={4} fill="#8a5a32" {...st} />
      <path d="M -140 -40 Q -40 -90 100 -64 Q 130 -56 130 -40 Z" fill="#f4f6f8" {...st} />
      <circle cx={-118} cy={-62} r={30} fill="#f4f6f8" {...st} />
      <path d="M -134 -60 Q -118 -46 -102 -60" fill="none" stroke="#c0261b" strokeWidth={6} />
      <path d="M 196 -26 L 300 -60" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Nhiệt kế: cột đỏ tụt từ `from` xuống `to` độ C trong [at, at+dur]. */
export const Thermometer: React.FC<{w: number; h: number; at: number; dur?: number; from?: number; to?: number}> = ({w, h, at, dur = 40, from = -5, to = -40}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + dur], [from, to], clamp);
  const tube = {x: w * 0.42, y: h * 0.08, w: w * 0.16, h: h * 0.72};
  const yOf = (deg: number) => tube.y + tube.h * ((10 - deg) / 55);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect x={tube.x} y={tube.y} width={tube.w} height={tube.h} rx={tube.w / 2} fill="#fdfdfd" stroke={C.ink} strokeWidth={6} />
      <rect x={tube.x + tube.w * 0.25} y={yOf(v)} width={tube.w * 0.5} height={tube.y + tube.h - yOf(v) + 10} fill={C.blood} />
      <circle cx={w / 2} cy={tube.y + tube.h + w * 0.1} r={w * 0.16} fill={C.blood} stroke={C.ink} strokeWidth={6} />
      {[10, 0, -10, -20, -30, -40].map((d) => (
        <g key={d}>
          <line x1={tube.x - 30} x2={tube.x} y1={yOf(d)} y2={yOf(d)} stroke={C.ink} strokeWidth={4} />
          <text x={tube.x - 40} y={yOf(d) + 14} textAnchor="end" fontFamily="Anton" fontSize={42} fill={d === -40 ? C.blood : C.ink}>
            {d}°
          </text>
        </g>
      ))}
      <text x={w / 2} y={h - 10} textAnchor="middle" fontFamily="Anton" fontSize={70} fill={C.blood}>
        {Math.round(v)}°C
      </text>
    </svg>
  );
};

/** Đồng hồ ánh ngày: hình tròn 24 giờ, phần sáng thu lại còn `hours` giờ. */
export const DaylightClock: React.FC<{size: number; at: number; hours?: number}> = ({size, at, hours = 6}) => {
  const frame = useCurrentFrame();
  const hh = interpolate(frame, [at, at + 30], [12, hours], clamp);
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const a = (hh / 24) * Math.PI * 2;
  const s0 = -Math.PI / 2 - a / 2;
  const s1 = -Math.PI / 2 + a / 2;
  const p = (ang: number) => `${cx + r * Math.cos(ang)} ${cy + r * Math.sin(ang)}`;
  return (
    <svg width={size} height={size} style={{position: 'absolute', inset: 0}}>
      <circle cx={cx} cy={cy} r={r} fill="#1f2a3a" stroke={C.ink} strokeWidth={6} />
      <path d={`M ${cx} ${cy} L ${p(s0)} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${p(s1)} Z`} fill={C.mustard} stroke={C.ink} strokeWidth={5} />
      {new Array(24).fill(0).map((_, i) => {
        const g = (i / 24) * Math.PI * 2;
        return <line key={i} x1={cx + r * 0.88 * Math.cos(g)} y1={cy + r * 0.88 * Math.sin(g)} x2={cx + r * Math.cos(g)} y2={cy + r * Math.sin(g)} stroke="#e9e3d2" strokeWidth={3} />;
      })}
      <text x={cx} y={cy + r * 0.25} textAnchor="middle" fontFamily="Anton" fontSize={size * 0.16} fill="#fff" stroke={C.ink} strokeWidth={3} paintOrder="stroke">
        ~{Math.round(hh)} HRS
      </text>
    </svg>
  );
};
