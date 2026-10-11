import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Character} from '../components/Character';
import {C} from '../lib/theme';

// Avatar kênh "Our Story" (vuông, nền tảng tự cắt tròn). Mọi thứ quan trọng nằm trong vòng tròn nội tiếp.
// Nhân vật kể chuyện soi kính lúp, quanh đầu là một vòng tư liệu lịch sử ghim trên bảng, nền tia nắng kiểu áp phích cổ.
// tight: bản cho TikTok (avatar hiện rất nhỏ) → nhân vật và chữ to hơn, ít chi tiết hơn.

const S = 1080;
const INK = C.ink;
const st = {stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// Các biểu tượng lịch sử nhỏ, vẽ trong ô 160x160.
export const Pyramid = () => (
  <g>
    <rect width={160} height={160} fill="#9fd0ea" />
    <circle cx={120} cy={42} r={18} fill={C.mustard} {...st} strokeWidth={4} />
    <path d="M 10 140 L 80 40 L 150 140 Z" fill="#e3c27a" {...st} />
    <path d="M 80 40 L 100 140" {...st} fill="none" strokeWidth={4} />
    <rect y={138} width={160} height={22} fill="#d8b96e" />
  </g>
);
export const Ship = () => (
  <g>
    <rect width={160} height={160} fill="#bfdbe8" />
    <path d="M 0 128 Q 40 118 80 128 T 160 128 L 160 160 L 0 160 Z" fill="#2f6f9a" />
    <path d="M 26 112 L 134 112 L 118 136 L 40 136 Z" fill="#8a5a32" {...st} />
    <path d="M 80 112 L 80 24" {...st} />
    <path d="M 84 30 Q 124 56 84 92 Z" fill="#f3eee3" {...st} strokeWidth={4} />
    <path d="M 76 40 Q 44 64 76 96 Z" fill="#f3eee3" {...st} strokeWidth={4} />
    <path d="M 80 24 L 100 30 L 80 36" fill={C.blood} />
  </g>
);
export const Helmet = () => (
  <g>
    <rect width={160} height={160} fill="#e9dcc0" />
    <path d="M 36 120 Q 30 40 80 34 Q 130 40 124 120 L 104 120 L 104 92 L 56 92 L 56 120 Z" fill="#c9a24a" {...st} />
    <path d="M 56 92 L 104 92" {...st} />
    <path d="M 80 34 Q 70 10 96 8 Q 120 10 112 30" fill={C.blood} {...st} strokeWidth={4} />
  </g>
);
export const MapX = () => (
  <g>
    <rect width={160} height={160} fill="#efe3c4" />
    <path d="M 20 40 Q 60 20 90 50 T 140 60 Q 150 110 110 130 T 30 120 Q 10 80 20 40 Z" fill="#d9c79b" {...st} strokeWidth={4} />
    <path d="M 40 70 Q 70 60 80 90 T 110 100" fill="none" stroke={C.blood} strokeWidth={5} strokeDasharray="8 7" />
    <path d="M 104 88 L 122 106 M 122 88 L 104 106" stroke={C.blood} strokeWidth={8} strokeLinecap="round" />
  </g>
);
export const Hourglass = () => (
  <g>
    <rect width={160} height={160} fill="#d7e3d0" />
    <rect x={40} y={20} width={80} height={14} rx={4} fill="#8a5a32" {...st} strokeWidth={4} />
    <rect x={40} y={126} width={80} height={14} rx={4} fill="#8a5a32" {...st} strokeWidth={4} />
    <path d="M 50 34 Q 50 70 80 80 Q 110 70 110 34 Z M 50 126 Q 50 90 80 80 Q 110 90 110 126 Z" fill="#f6f1e3" {...st} strokeWidth={4} />
    <path d="M 60 120 Q 80 96 100 120 Z M 66 48 Q 80 66 94 48 Z" fill={C.mustard} />
  </g>
);
export const Castle = () => (
  <g>
    <rect width={160} height={160} fill="#c9d3dc" />
    <path d="M 20 140 L 20 60 L 34 60 L 34 72 L 48 72 L 48 60 L 62 60 L 62 80 L 98 80 L 98 60 L 112 60 L 112 72 L 126 72 L 126 60 L 140 60 L 140 140 Z" fill="#9aa4ad" {...st} strokeWidth={4} />
    <path d="M 66 140 L 66 110 Q 80 94 94 110 L 94 140 Z" fill="#4a3a2c" {...st} strokeWidth={4} />
    <path d="M 80 80 L 80 40 M 80 40 L 104 48 L 80 56" stroke={INK} strokeWidth={4} fill={C.blood} />
  </g>
);

export const ICONS = [Pyramid, Ship, Helmet, MapX, Hourglass, Castle];

/** Mảnh giấy ảnh cắt dán (SVG), xoay, có bóng và ghim đỏ. */
export const Card: React.FC<{cx: number; cy: number; rot: number; size: number; Icon: React.FC}> = ({cx, cy, rot, size, Icon}) => {
  const k = size / 160;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${k}) translate(-95 -95)`}>
      <rect x={14} y={18} width={190} height={190} fill="rgba(0,0,0,0.35)" />
      <rect width={190} height={190} fill="#fbfaf6" stroke={INK} strokeWidth={4} />
      <g transform="translate(15 15)">
        <Icon />
        <rect width={160} height={160} fill="none" stroke={INK} strokeWidth={3} />
      </g>
      <circle cx={95} cy={10} r={14} fill="#c0261b" stroke={INK} strokeWidth={4} />
      <circle cx={90} cy={5} r={4} fill="#fff" opacity={0.6} />
    </g>
  );
};

/** Ruy băng đuôi én. */
export const Ribbon: React.FC<{cx: number; cy: number; w: number; h: number; text: string; size: number}> = ({cx, cy, w, h, text, size}) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const tail = h * 0.55;
  return (
    <g transform={`rotate(-4 ${cx} ${cy})`}>
      {/* đuôi */}
      <path d={`M ${x0 + 40} ${y0 + 34} L ${x0 - tail} ${y0 + 34} L ${x0 - tail + 50} ${y1 + 2 + 17} L ${x0 - tail} ${y1 + 38} L ${x0 + 40} ${y1 + 38} Z`} fill="#8e1a12" {...st} strokeWidth={8} />
      <path d={`M ${x1 - 40} ${y0 + 34} L ${x1 + tail} ${y0 + 34} L ${x1 + tail - 50} ${y1 + 2 + 17} L ${x1 + tail} ${y1 + 38} L ${x1 - 40} ${y1 + 38} Z`} fill="#8e1a12" {...st} strokeWidth={8} />
      {/* thân ruy băng */}
      <rect x={x0 + 10} y={y0 + 14} width={w} height={h} fill="rgba(0,0,0,0.4)" />
      <rect x={x0} y={y0} width={w} height={h} fill={C.blood} {...st} strokeWidth={9} />
      <path d={`M ${x0 + 14} ${y0 + 16} L ${x1 - 14} ${y0 + 16}`} stroke="#e8564a" strokeWidth={6} />
      <text x={cx} y={cy + size * 0.36} textAnchor="middle" fontFamily="Anton" fontSize={size} letterSpacing={4} fill="#ffffff" stroke={INK} strokeWidth={10} paintOrder="stroke">
        {text}
      </text>
    </g>
  );
};

/** Kính lúp soi một mắt của nhân vật: mắt phóng to sau tròng kính, cán gỗ chéo xuống. */
export const Magnifier: React.FC<{eyeX: number; eyeY: number; lensR: number}> = ({eyeX, eyeY, lensR}) => (
  <g>
    <path d={`M ${eyeX + lensR * 0.7} ${eyeY + lensR * 0.7} L ${eyeX + lensR * 2.1} ${eyeY + lensR * 2.3}`} stroke="#6e4a2a" strokeWidth={lensR * 0.42} strokeLinecap="round" />
    <circle cx={eyeX} cy={eyeY} r={lensR} fill="#eaf6ff" />
    <ellipse cx={eyeX + 4} cy={eyeY + 6} rx={lensR * 0.42} ry={lensR * 0.52} fill={INK} />
    <circle cx={eyeX + lensR * 0.18} cy={eyeY - lensR * 0.12} r={lensR * 0.15} fill="#fff" />
    <path d={`M ${eyeX - lensR * 0.55} ${eyeY - lensR * 0.45} Q ${eyeX - lensR * 0.2} ${eyeY - lensR * 0.75} ${eyeX + lensR * 0.2} ${eyeY - lensR * 0.7}`} stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />
    <circle cx={eyeX} cy={eyeY} r={lensR} fill="none" stroke="#c9a24a" strokeWidth={lensR * 0.2} />
    <circle cx={eyeX} cy={eyeY} r={lensR * 1.1} fill="none" stroke={INK} strokeWidth={7} />
    <circle cx={eyeX} cy={eyeY} r={lensR * 0.9} fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

export const OurStoryAvatar: React.FC<{tight?: boolean}> = ({tight}) => {
  const scale = tight ? 3.15 : 2.7;
  const charY = tight ? 1240 : 1170;
  const headCy = charY - 232 * scale;
  const eyeX = 540 + 22 * scale;
  const eyeY = charY - 236 * scale;
  const lensR = 34 * scale;
  const cards = tight
    ? [
        {a: -58, r: 400, Icon: ICONS[0]},
        {a: 0, r: 420, Icon: ICONS[1]},
        {a: 58, r: 400, Icon: ICONS[3]},
      ]
    : [
        {a: -78, r: 360, Icon: ICONS[4]},
        {a: -40, r: 395, Icon: ICONS[0]},
        {a: 0, r: 410, Icon: ICONS[1]},
        {a: 40, r: 395, Icon: ICONS[2]},
        {a: 78, r: 360, Icon: ICONS[3]},
      ];
  const rays = 24;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Img src={staticFile('vox/board.jpg')} style={{position: 'absolute', inset: 0, width: S, height: S, objectFit: 'cover', opacity: 0.5}} />
      <svg viewBox={`0 0 ${S} ${S}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="avGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="0.55" stopColor={C.mustard} />
            <stop offset="1" stopColor="#c9861f" />
          </radialGradient>
          <clipPath id="avDisc">
            <circle cx={540} cy={540} r={500} />
          </clipPath>
        </defs>
        {/* đĩa tia nắng kiểu áp phích cổ */}
        <g clipPath="url(#avDisc)">
          <circle cx={540} cy={540} r={500} fill="url(#avGlow)" />
          {new Array(rays).fill(0).map((_, i) => {
            const a0 = (i / rays) * Math.PI * 2;
            const a1 = ((i + 0.5) / rays) * Math.PI * 2;
            const R = 800;
            return <path key={i} d={`M 540 ${headCy} L ${540 + Math.cos(a0) * R} ${headCy + Math.sin(a0) * R} L ${540 + Math.cos(a1) * R} ${headCy + Math.sin(a1) * R} Z`} fill="#e9a52a" opacity={0.55} />;
          })}
        </g>
        <circle cx={540} cy={540} r={500} fill="none" stroke={INK} strokeWidth={12} />
        <circle cx={540} cy={540} r={478} fill="none" stroke="#fff3cf" strokeWidth={5} strokeDasharray="4 14" opacity={0.8} />

        {/* dây đỏ nối các tấm ảnh */}
        <path
          d={cards
            .map((cd, i) => {
              const r = (cd.a * Math.PI) / 180;
              return `${i ? 'L' : 'M'} ${540 + Math.sin(r) * cd.r} ${headCy - Math.cos(r) * cd.r * 0.62 - 10}`;
            })
            .join(' ')}
          fill="none"
          stroke="#b5221a"
          strokeWidth={8}
          strokeLinejoin="round"
        />
        {cards.map((cd, i) => {
          const r = (cd.a * Math.PI) / 180;
          return <Card key={i} cx={540 + Math.sin(r) * cd.r} cy={headCy - Math.cos(r) * cd.r * 0.62 + (tight ? 70 : 60) - (cd.a === 0 ? 50 : 0)} rot={cd.a * 0.25 + (i % 2 ? 5 : -5)} size={tight ? 190 : 150} Icon={cd.Icon} />;
        })}

        {/* nhân vật kể chuyện */}
        <Character x={540} y={charY} scale={scale} headOnly expr="smirk" headTilt={-4} seed={4} />
        <Magnifier eyeX={eyeX} eyeY={eyeY} lensR={lensR} />

        <Ribbon cx={540} cy={tight ? 822 : 806} w={tight ? 640 : 580} h={tight ? 160 : 140} text="OUR STORY" size={tight ? 132 : 116} />
      </svg>
    </AbsoluteFill>
  );
};

