import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {Glow, H, Rivets, W} from './common';

const s6 = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const};

/** Bảng điều khiển có đồng hồ kim rung và đèn nhấp nháy. */
export const Console: React.FC<{x: number; y: number; w: number; h: number; seed?: number}> = ({x, y, w, h, seed = 1}) => {
  const frame = useCurrentFrame();
  const dials = Math.max(2, Math.floor(w / 130));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={C.steel} {...s6} />
      <rect x={x + 16} y={y + 16} width={w - 32} height={h * 0.38} rx={6} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
      {new Array(dials).fill(0).map((_, i) => {
        const cx = x + 60 + i * ((w - 120) / Math.max(1, dials - 1));
        const cy = y + 16 + h * 0.19;
        const r = Math.min(40, h * 0.15);
        const a = -0.8 + 0.5 * Math.sin(frame / (11 + i * 3) + seed + i) + 0.1 * Math.sin(frame * 1.7 + i);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="#e9eadf" stroke={C.ink} strokeWidth={4} />
            <line x1={cx} y1={cy} x2={cx + Math.cos(a - Math.PI / 2) * r * 0.8} y2={cy + Math.sin(a - Math.PI / 2) * r * 0.8} stroke={C.blood} strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })}
      {new Array(Math.floor(w / 46)).fill(0).map((_, i) => {
        const on = random(`l${seed}-${i}-${Math.floor(frame / (8 + (i % 5) * 4))}`) > 0.45;
        const col = [C.radar, '#ff5a4a', C.mustard][i % 3];
        return <circle key={i} cx={x + 34 + i * 46} cy={y + h * 0.62} r={9} fill={on ? col : '#2a2f36'} stroke={C.ink} strokeWidth={3} />;
      })}
      {new Array(Math.floor(w / 70)).fill(0).map((_, i) => (
        <rect key={i} x={x + 26 + i * 70} y={y + h * 0.76} width={40} height={18} rx={4} fill="#d8d8cf" stroke={C.ink} strokeWidth={3} />
      ))}
    </g>
  );
};

/** Phòng chỉ huy tác chiến (CIC) trên tàu giữa đêm bão. */
export const CICRoom: React.FC<{lightning?: number; children?: React.ReactNode; behind?: React.ReactNode; redAlert?: number}> = ({
  lightning = 0,
  children,
  behind,
  redAlert = 0,
}) => {
  const frame = useCurrentFrame();
  const ph = frame / 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="cicwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e3946" />
          <stop offset="100%" stopColor="#1c232c" />
        </linearGradient>
        <radialGradient id="tableGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.radar} stopOpacity={0.55} />
          <stop offset="100%" stopColor={C.radar} stopOpacity={0} />
        </radialGradient>
        <clipPath id="winClip">
          <rect x={1180} y={130} width={680} height={380} rx={14} />
        </clipPath>
        <Glow id="cicGlow" sd={10} />
      </defs>
      <rect width={W} height={H} fill="url(#cicwall)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={i * 340 - 40} y={0} width={340} height={H} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
          <Rivets x={i * 340 - 40} y={0} w={340} h={H} gap={110} />
        </g>
      ))}
      {/* cửa kính nhìn ra bão */}
      <g clipPath="url(#winClip)">
        <rect x={1180} y={130} width={680} height={380} fill="#0b1422" />
        <rect x={1180} y={130} width={680} height={380} fill="#d9e8ff" opacity={lightning * 0.85} />
        {lightning > 0.3 ? <path d="M 1560 130 L 1530 230 L 1570 240 L 1520 360" stroke="#ffffff" strokeWidth={6} fill="none" /> : null}
        <path d={`M 1180 ${360 + 30 * Math.sin(ph / 2)} Q 1350 ${300 + 40 * Math.sin(ph / 2 + 1)} 1520 ${350 + 30 * Math.sin(ph / 2 + 2)} T 1860 ${330 + 30 * Math.sin(ph / 2 + 3)} L 1860 510 L 1180 510 Z`} fill="#15283f" stroke={C.ink} strokeWidth={4} />
        <path d={`M 1180 ${430 + 22 * Math.sin(ph / 1.5)} Q 1400 ${390 + 30 * Math.sin(ph / 1.5 + 2)} 1600 ${430 + 20 * Math.sin(ph / 1.5 + 1)} T 1860 ${420 + 25 * Math.sin(ph / 1.5)} L 1860 510 L 1180 510 Z`} fill="#0f2034" stroke={C.ink} strokeWidth={4} />
        {new Array(40).fill(0).map((_, i) => {
          const xx = 1180 + random(`w${i}`) * 680;
          const yy = (random(`wy${i}`) * 380 + frame * 22) % 380;
          return <line key={i} x1={xx} y1={130 + yy} x2={xx - 10} y2={130 + yy + 40} stroke="#bcd3ee" strokeWidth={2} opacity={0.6} />;
        })}
      </g>
      <rect x={1180} y={130} width={680} height={380} rx={14} fill="none" stroke={C.ink} strokeWidth={14} />
      <path d="M 1520 130 L 1520 510" stroke={C.ink} strokeWidth={12} />
      <Console x={40} y={360} w={560} h={360} seed={2} />
      <Console x={1220} y={600} w={660} h={300} seed={5} />
      {behind}
      {/* bàn radar */}
      <ellipse cx={870} cy={870} rx={420} ry={150} fill="url(#tableGlow)" />
      <path d="M 520 860 L 560 1080 L 1180 1080 L 1220 860 Z" fill={C.steelDark} {...s6} />
      <ellipse cx={870} cy={860} rx={350} ry={92} fill={C.steel} {...s6} />
      <ellipse cx={870} cy={860} rx={250} ry={64} fill={C.radarBg} stroke={C.ink} strokeWidth={5} />
      <g filter="url(#cicGlow)">
        <ellipse cx={870} cy={860} rx={180} ry={46} fill="none" stroke={C.radarDim} strokeWidth={3} />
        <line x1={870} y1={860} x2={870 + 240 * Math.cos(frame / 12)} y2={860 + 62 * Math.sin(frame / 12)} stroke={C.radar} strokeWidth={4} />
        <circle cx={980} cy={838} r={7} fill={C.radar} />
        <circle cx={1010} cy={866} r={6} fill={C.radar} />
      </g>
      {/* đèn trần */}
      <path d="M 860 0 L 860 60" stroke={C.ink} strokeWidth={8} />
      <path d="M 800 60 L 920 60 L 900 100 L 820 100 Z" fill="#5b2620" {...s6} />
      <ellipse cx={860} cy={108} rx={46} ry={12} fill={redAlert > 0 ? '#ff4a3a' : '#7a2a22'} />
      {children}
      {redAlert > 0 ? <rect width={W} height={H} fill="#ff2a1a" opacity={redAlert * (0.12 + 0.12 * Math.max(0, Math.sin(frame / 3)))} /> : null}
    </svg>
  );
};

export const DeskLamp: React.FC<{x: number; y: number; on?: number; flip?: boolean}> = ({x, y, on = 1, flip}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <path d="M 0 0 L 120 230" stroke="none" />
    <polygon points="-10,30 230,330 -230,330" fill={C.lamp} opacity={0.18 * on} />
    <ellipse cx={0} cy={330} rx={90} ry={16} fill={C.ink} />
    <path d="M 0 330 L -40 160 L 30 60" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M -50 60 Q 30 -20 110 60 L 80 70 Q 30 30 -20 70 Z" fill="#3e6b4f" {...s6} transform="rotate(-20 30 60)" />
    <circle cx={34} cy={74} r={14} fill={on ? '#fff3c4' : '#666'} stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Máy đánh chữ nhìn chính diện. */
export const TypewriterMachine: React.FC<{x: number; y: number; s?: number; paperUp?: number}> = ({x, y, s = 1, paperUp = 0}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-110} y={-120 - paperUp * 60} width={220} height={150} fill="#fbf8ef" {...s6} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-80} y1={-90 + i * 24 - paperUp * 60} x2={-80 + ((frame * 6 + i * 70) % 160)} y2={-90 + i * 24 - paperUp * 60} stroke="#999" strokeWidth={4} />
      ))}
      <rect x={-200} y={-40} width={400} height={50} rx={18} fill="#2f2f33" {...s6} />
      <path d="M -230 10 L 230 10 L 260 120 L -260 120 Z" fill="#3b3b40" {...s6} />
      {[0, 1, 2].map((r) =>
        new Array(10 - r).fill(0).map((_, i) => {
          const kx = -180 + r * 18 + i * 40;
          const ky = 40 + r * 26;
          const down = random(`k${r}-${i}-${Math.floor(frame / 3)}`) > 0.85 ? 3 : 0;
          return <circle key={`${r}-${i}`} cx={kx} cy={ky + down} r={11} fill="#e6e0d0" stroke={C.ink} strokeWidth={3} />;
        }),
      )}
    </g>
  );
};

/** Cabin chỉ huy: tường thép, cửa sổ tròn có mưa, bàn gỗ, đèn bàn. */
export const Cabin: React.FC<{children?: React.ReactNode; front?: React.ReactNode}> = ({children, front}) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="cabinLight" cx="30%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#5b5442" />
          <stop offset="100%" stopColor="#1f2228" />
        </radialGradient>
        <clipPath id="port">
          <circle cx={1500} cy={330} r={150} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#cabinLight)" />
      <Rivets x={0} y={0} w={W} h={H * 0.7} gap={120} />
      <g clipPath="url(#port)">
        <rect x={1340} y={170} width={320} height={320} fill="#0b1422" />
        <path d={`M 1340 ${360 + 20 * Math.sin(frame / 12)} Q 1500 ${320 + 30 * Math.sin(frame / 12 + 1)} 1660 ${350} L 1660 500 L 1340 500 Z`} fill="#17304a" />
        {new Array(20).fill(0).map((_, i) => {
          const xx = 1350 + random(`p${i}`) * 300;
          const yy = (random(`py${i}`) * 320 + frame * 18) % 320;
          return <line key={i} x1={xx} y1={170 + yy} x2={xx - 6} y2={170 + yy + 30} stroke="#bcd3ee" strokeWidth={2} />;
        })}
      </g>
      <circle cx={1500} cy={330} r={150} fill="none" stroke="#8a7a52" strokeWidth={26} />
      <circle cx={1500} cy={330} r={150} fill="none" stroke={C.ink} strokeWidth={6} />
      {children}
      <rect x={-20} y={760} width={W + 40} height={340} fill={C.wood} {...s6} />
      <rect x={-20} y={760} width={W + 40} height={34} fill={C.woodDark} {...s6} />
      {front}
    </svg>
  );
};

/** Phòng làm việc: tường sáng, giá sách, cửa sổ, bàn gỗ (như ảnh tham chiếu McNamara). */
export const Study: React.FC<{children?: React.ReactNode; front?: React.ReactNode}> = ({children, front}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <rect width={W} height={H} fill="#f5f2ea" />
    <path d="M 0 820 L 1920 760" stroke={C.ink} strokeWidth={5} />
    <rect x={120} y={120} width={420} height={420} fill="#dfeef6" {...s6} />
    <path d="M 330 120 L 330 540 M 120 330 L 540 330" stroke={C.ink} strokeWidth={8} />
    <rect x={1300} y={80} width={560} height={720} fill="#efe6d4" {...s6} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={1300} y={240 + r * 170} width={560} height={14} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        {new Array(11).fill(0).map((_, i) => {
          const bw = 30 + random(`bw${r}${i}`) * 22;
          const bh = 90 + random(`bh${r}${i}`) * 50;
          const col = ['#8b3a2e', '#33506e', '#6d6a3a', '#c9b27f', '#5d4a6e', '#e3dccb'][Math.floor(random(`bc${r}${i}`) * 6)];
          return <rect key={i} x={1316 + i * 48} y={240 + r * 170 - bh} width={bw} height={bh} fill={col} stroke={C.ink} strokeWidth={3.5} />;
        })}
      </g>
    ))}
    {children}
    <path d="M 220 760 L 1700 700 L 1760 1080 L 160 1080 Z" fill="#c79a66" {...s6} />
    <path d="M 220 760 L 1700 700 L 1702 730 L 222 792 Z" fill="#a77b4c" stroke={C.ink} strokeWidth={4} />
    {front}
  </svg>
);

/** Quạt trần: cánh quạt xoay (nhìn chéo nên dẹt theo trục dọc). */
export const CeilingFan: React.FC<{x: number; y: number; speed?: number}> = ({x, y, speed = 9}) => {
  const frame = useCurrentFrame();
  const a = (frame * speed) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 ${-y} L 0 -16`} stroke={C.ink} strokeWidth={8} />
      <g transform="scale(1 0.22)">
        {[0, 90, 180, 270].map((b) => (
          <ellipse key={b} cx={130} cy={0} rx={130} ry={28} fill={C.woodDark} stroke={C.ink} strokeWidth={10} transform={`rotate(${a + b})`} />
        ))}
      </g>
      <ellipse cx={0} cy={-6} rx={30} ry={18} fill="#c9b27f" {...s6} />
    </g>
  );
};

/** Phòng khách Hà Nội: tường vàng, cửa sổ chớp xanh ngập sáng, quạt trần, bàn trà. */
export const HanoiRoom: React.FC<{children?: React.ReactNode; front?: React.ReactNode}> = ({children, front}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="winlight" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fffbe6" />
        <stop offset="100%" stopColor="#fff2b8" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="#e8c873" />
    <rect x={0} y={760} width={W} height={320} fill="#b98a52" />
    <path d="M 0 760 L 1920 760" stroke={C.ink} strokeWidth={6} />
    {/* sàn gạch hoa */}
    {new Array(14).fill(0).map((_, i) => (
      <path key={i} d={`M ${i * 160 - 400} 1080 L ${i * 120 + 120} 760`} stroke="#9c7140" strokeWidth={4} />
    ))}
    <rect x={1180} y={140} width={420} height={560} fill="#fff8d6" {...s6} />
    <rect x={1180} y={140} width={420} height={560} fill="url(#winlight)" />
    <path d="M 1390 140 L 1390 700" stroke={C.ink} strokeWidth={8} />
    {/* cánh chớp xanh */}
    {[1070, 1600].map((sx, k) => (
      <g key={sx}>
        <rect x={sx} y={140} width={110} height={560} fill="#3f7f5f" {...s6} />
        {new Array(14).fill(0).map((_, i) => (
          <line key={i} x1={sx + 10} y1={170 + i * 38} x2={sx + 100} y2={170 + i * 38 + (k ? -8 : 8)} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
    ))}
    {/* cây ngoài cửa sổ */}
    <circle cx={1300} cy={300} r={70} fill="#9cc77a" opacity={0.6} />
    <circle cx={1480} cy={260} r={90} fill="#8dbb6c" opacity={0.6} />
    <polygon points="1180,700 1600,700 1900,1080 880,1080" fill="#fff6c8" opacity={0.25} />
    {children}
    {front}
  </svg>
);

export const Teacup: React.FC<{x: number; y: number; s?: number; steam?: boolean}> = ({x, y, s = 1, steam = true}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {steam
        ? [0, 1].map((i) => (
            <path
              key={i}
              d={`M ${-8 + i * 16} -40 q 12 -20 0 -40 q -12 -20 0 -40`}
              stroke="#ffffff"
              strokeWidth={5}
              fill="none"
              opacity={0.35 + 0.25 * Math.sin(frame / 10 + i)}
              transform={`translate(0 ${-((frame / 2 + i * 10) % 20)})`}
            />
          ))
        : null}
      <ellipse cx={0} cy={6} rx={46} ry={10} fill="#f2efe7" stroke={C.ink} strokeWidth={4} />
      <path d="M -30 -34 L 30 -34 L 22 4 L -22 4 Z" fill="#f7f4ec" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -30 -20 L 30 -20" stroke="#3f7f9f" strokeWidth={4} />
    </g>
  );
};
