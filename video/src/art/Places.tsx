import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {Cloud, H, Puff, Stars, W, wavePath} from './common';

const s6 = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const};

/** Nhà Trắng ban đêm (giản lược), cửa sổ sáng đèn. */
export const WhiteHouse: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="whsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#081124" />
          <stop offset="100%" stopColor="#24375a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#whsky)" />
      <Stars frame={frame} n={90} maxY={420} />
      <rect x={260} y={430} width={1400} height={360} fill="#eef0f2" {...s6} />
      <rect x={260} y={410} width={1400} height={30} fill="#dfe3e8" {...s6} />
      <path d="M 720 410 L 960 270 L 1200 410 Z" fill="#eef0f2" {...s6} />
      <path d="M 960 270 L 960 170" stroke={C.ink} strokeWidth={6} />
      <path d={`M 960 172 Q 1010 ${182 + 8 * Math.sin(frame / 6)} 1060 172 L 1060 222 Q 1010 ${232 + 8 * Math.sin(frame / 6 + 1)} 960 222 Z`} fill="#c33" stroke={C.ink} strokeWidth={4} />
      {cols.map((i) => (
        <rect key={i} x={735 + i * 85} y={440} width={30} height={350} fill="#f9fafb" stroke={C.ink} strokeWidth={4} />
      ))}
      {new Array(12).fill(0).map((_, i) => {
        const wx = 300 + i * 115 + (i >= 4 ? 520 : 0) - (i >= 8 ? 520 : 0);
        if (wx > 690 && wx < 1210) {
          return null;
        }
        return [0, 1].map((r) => {
          const lit = random(`wh${i}${r}`) > 0.25;
          return <rect key={`${i}-${r}`} x={wx} y={480 + r * 150} width={56} height={90} fill={lit ? '#ffd56b' : '#41506b'} stroke={C.ink} strokeWidth={4} />;
        });
      })}
      <rect x={0} y={790} width={W} height={290} fill="#1d3a2a" />
      <path d="M 0 790 L 1920 790" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={960} cy={940} rx={220} ry={46} fill="#9fb7c9" stroke={C.ink} strokeWidth={5} />
      <rect width={W} height={H} fill="#0a1020" opacity={0.15} />
    </svg>
  );
};

/** Máy bay phản lực nhìn ngang, mũi hướng phải. */
export const Jet: React.FC<{x: number; y: number; s?: number; angle?: number; burner?: boolean}> = ({x, y, s = 1, angle = 0, burner = true}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      {burner ? <ellipse cx={-150} cy={0} rx={40 + 8 * Math.sin(frame)} ry={12} fill="#ffb347" opacity={0.9} /> : null}
      <path d="M -130 -14 L 90 -16 Q 150 -10 170 0 Q 150 10 90 14 L -130 14 Z" fill="#9aa6b2" {...s6} />
      <path d="M -40 -12 L -90 -80 L -50 -80 L 20 -12 Z" fill="#7d8b99" {...s6} />
      <path d="M -40 12 L -100 60 L -62 60 L 10 12 Z" fill="#7d8b99" {...s6} />
      <path d="M -120 -12 L -150 -56 L -122 -56 L -96 -12 Z" fill="#7d8b99" {...s6} />
      <path d="M 70 -14 Q 100 -34 130 -8 Z" fill="#b8e1ff" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Boong tàu sân bay, máy bay lần lượt cất cánh (launches: frame cất cánh). */
export const CarrierDeck: React.FC<{launches: number[]}> = ({launches}) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="cdsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6fa8cf" />
          <stop offset="100%" stopColor="#e7d6b5" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cdsky)" />
      {[0, 1, 2].map((i) => (
        <Cloud key={i} x={((i * 700 + frame * 0.8) % (W + 500)) - 250} y={160 + i * 60} s={1.2} fill="#f6efe2" />
      ))}
      <rect x={0} y={560} width={W} height={520} fill="#2f6f9a" />
      <path d="M -100 1080 L 520 600 L 1720 600 L 2100 1080 Z" fill="#5a6470" {...s6} />
      <path d="M 960 1080 L 1120 600" stroke="#f1f1f1" strokeWidth={10} strokeDasharray="50 40" />
      <path d="M 1500 600 L 1560 330 L 1700 330 L 1720 600 Z" fill="#7d8b99" {...s6} />
      <rect x={1580} y={360} width={110} height={34} fill="#22303c" stroke={C.ink} strokeWidth={4} />
      <path d="M 1630 330 L 1630 230 M 1590 260 L 1670 260" stroke={C.ink} strokeWidth={8} />
      {launches.map((at, i) => {
        const k = (frame - at) / 40;
        if (k < -0.6) {
          return <Jet key={i} x={760 + i * 120} y={980 - i * 60} s={0.9 - i * 0.12} angle={-20} burner={false} />;
        }
        const kk = Math.max(0, k);
        const x = 760 + i * 120 + kk * kk * 1800;
        const y = 980 - i * 60 - kk * kk * 1100;
        return (
          <g key={i}>
            <Puff x={760 + i * 120 - 80} y={1000 - i * 60} k={Math.min(1, kk * 1.4)} s={1.4} color="#e9eef2" />
            <Jet x={x} y={y} s={(0.9 - i * 0.12) * (1 - kk * 0.4)} angle={-20 - kk * 10} />
          </g>
        );
      })}
    </svg>
  );
};

/** Bờ biển miền Bắc: núi đá vôi nhiều lớp sương, pháo phòng không bắn lên trời. */
export const Coast: React.FC<{shots: number[]; children?: React.ReactNode}> = ({shots, children}) => {
  const frame = useCurrentFrame();
  const karst = (x: number, base: number, h: number, w: number) =>
    `M ${x - w} ${base} Q ${x - w * 0.9} ${base - h * 0.6} ${x - w * 0.5} ${base - h} Q ${x - w * 0.1} ${base - h * 1.08} ${x + w * 0.3} ${base - h * 0.85} Q ${x + w * 0.8} ${base - h * 0.5} ${x + w} ${base} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="cosky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d7d2" />
          <stop offset="100%" stopColor="#efe7cf" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cosky)" />
      {shots.map((at, i) => {
        const k = (frame - at - 8) / 50;
        return <Puff key={i} x={300 + random(`fx${i}`) * 1300} y={130 + random(`fy${i}`) * 260} k={k} s={0.7} color="#4a4a4a" />;
      })}
      <path d={karst(260, 700, 380, 220)} fill="#a9bdb0" stroke={C.ink} strokeWidth={5} />
      <path d={karst(700, 700, 300, 180)} fill="#9bb2a4" stroke={C.ink} strokeWidth={5} />
      <path d={karst(1500, 700, 420, 260)} fill="#a2b8aa" stroke={C.ink} strokeWidth={5} />
      <path d={karst(1100, 720, 230, 160)} fill="#7f9c88" stroke={C.ink} strokeWidth={5} />
      <rect x={0} y={700} width={W} height={380} fill="#5f8f99" />
      <path d={wavePath(706, 5, 150, frame / 20)} fill="#6d9ca5" />
      <path d={wavePath(820, 12, 280, frame / 16)} fill="#4f7f8a" stroke={C.ink} strokeWidth={4} />
      {children}
      <path d="M -50 1080 L -50 900 Q 300 850 640 900 Q 820 930 900 1080 Z" fill="#c9b07a" {...s6} />
      {/* ụ pháo phòng không */}
      {[200, 470].map((gx, gi) => {
        const fired = shots.filter((s) => frame >= s && frame < s + 6 && Math.round(s) % 2 === gi).length > 0;
        return (
          <g key={gx} transform={`translate(${gx} 930)`}>
            <path d="M -80 30 Q 0 -20 80 30 Z" fill="#7a8a5a" {...s6} />
            <path d="M 0 0 L 70 -110" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
            <path d="M 0 0 L 70 -110" stroke="#59633e" strokeWidth={8} strokeLinecap="round" />
            {fired ? <polygon points="70,-110 110,-170 82,-118 130,-140 76,-104" fill="#fff1b8" stroke="#ff9b2e" strokeWidth={4} /> : null}
          </g>
        );
      })}
    </svg>
  );
};

/** Máy bay trúng đạn: bốc khói, chúi xuống từ trái sang phải (k: 0 -> 1). */
export const FallingPlane: React.FC<{k: number}> = ({k}) => {
  if (k < 0) {
    return <Jet x={-200} y={240} s={0.6} angle={8} burner={false} />;
  }
  const kk = Math.min(1, k);
  const x = 200 + kk * 1100;
  const y = 240 + kk * kk * 520;
  const trail = new Array(14).fill(0).map((_, i) => {
    const t = Math.max(0, kk - i * 0.035);
    return [200 + t * 1100, 240 + t * t * 520] as const;
  });
  return (
    <g>
      {trail.map(([tx, ty], i) => (
        <circle key={i} cx={tx - 40} cy={ty} r={14 + i * 3} fill="#3d3d3d" opacity={0.55 - i * 0.035} stroke={C.ink} strokeWidth={2} />
      ))}
      <Jet x={x} y={y} s={0.6} angle={8 + kk * 30} burner={false} />
      <circle cx={x - 20} cy={y} r={16} fill="#ff8a2a" opacity={0.9} />
    </g>
  );
};

export const Parachute: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const frame = useCurrentFrame();
  const sway = 6 * Math.sin(frame / 14);
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`}>
      <path d="M -110 0 Q 0 -120 110 0 Q 82 -14 55 0 Q 28 -14 0 0 Q -28 -14 -55 0 Q -82 -14 -110 0 Z" fill="#f2f2ee" {...s6} />
      <path d="M -110 0 L -8 130 M -55 0 L -4 130 M 0 0 L 0 130 M 55 0 L 4 130 M 110 0 L 8 130" stroke={C.ink} strokeWidth={3} />
      <circle cx={0} cy={144} r={20} fill={C.white} stroke={C.ink} strokeWidth={5} />
      <path d="M -12 164 Q 0 220 12 164 Z" fill={C.olive} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Hội trường Quốc hội: tường gỗ, cờ, các hàng ghế đầy người (đầu tròn nhỏ). */
export const Congress: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const heads: React.ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    const n = 14 + row * 3;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.08 + (0.84 * i) / (n - 1));
      const rx = 560 + row * 170;
      const ry = 170 + row * 60;
      const x = 960 - Math.cos(a) * rx;
      const y = 620 + Math.sin(a) * ry * 0.9 + row * 30;
      const bob = 2 * Math.sin(frame / 8 + i + row);
      heads.push(
        <g key={`${row}-${i}`} transform={`translate(${x} ${y + bob})`}>
          <path d="M -24 50 Q -26 14 0 12 Q 26 14 24 50 Z" fill={['#2c3442', '#4b5866', '#6e4a2a'][(i + row) % 3]} stroke={C.ink} strokeWidth={3} />
          <circle r={20} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={-6} cy={-2} r={2.6} fill={C.ink} />
          <circle cx={6} cy={-2} r={2.6} fill={C.ink} />
        </g>,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill="#5a3b24" />
      {new Array(12).fill(0).map((_, i) => (
        <rect key={i} x={i * 170 - 20} y={0} width={150} height={560} fill="#6e4a2a" stroke={C.ink} strokeWidth={4} />
      ))}
      <rect x={0} y={540} width={W} height={540} fill="#3b6b4a" />
      <path d="M 0 540 L 1920 540" stroke={C.ink} strokeWidth={6} />
      {/* cờ Mỹ giản lược */}
      <g transform="translate(1500 90)">
        {new Array(7).fill(0).map((_, i) => (
          <rect key={i} x={0} y={i * 40} width={300} height={20} fill="#c33" />
        ))}
        <rect x={0} y={0} width={300} height={260} fill="none" stroke={C.ink} strokeWidth={5} />
        <rect x={0} y={0} width={130} height={120} fill="#2b3a6b" stroke={C.ink} strokeWidth={4} />
      </g>
      {/* bục chủ tọa */}
      <path d="M 760 560 L 1160 560 L 1200 700 L 720 700 Z" fill="#8a5a33" {...s6} />
      {children}
      {heads}
    </svg>
  );
};

/** Ngăn kéo gỗ mở ra, bên trong là bản dự thảo nghị quyết (open: 0 -> 1). */
export const DrawerDoc: React.FC<{open: number; docOut: number; stampAt?: number}> = ({open, docOut, stampAt}) => {
  const frame = useCurrentFrame();
  const stamp = stampAt !== undefined ? interpolate(frame, [stampAt, stampAt + 6], [2.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const docY = 640 - open * 140 - docOut * 360;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill="#3a2a1c" />
      <rect x={160} y={220} width={1600} height={900} fill={C.woodDark} {...s6} />
      <rect x={200} y={500} width={1520} height={560} fill="#2a1d12" stroke={C.ink} strokeWidth={6} />
      <g transform={`translate(0 ${docY})`}>
        <rect x={560} y={0} width={800} height={1000} fill="#fbf7ea" {...s6} transform="rotate(-2 960 500)" />
        <g transform="rotate(-2 960 500)">
          <text x={960} y={110} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={C.ink}>
            DỰ THẢO NGHỊ QUYẾT
          </text>
          <text x={960} y={170} textAnchor="middle" fontFamily="Roboto Mono" fontWeight={700} fontSize={30} fill="#6b6b6b">
            Washington · tháng 5/1964
          </text>
          {new Array(12).fill(0).map((_, i) => (
            <rect key={i} x={630} y={230 + i * 48} width={i % 4 === 3 ? 420 : 660} height={14} rx={7} fill="#cfc8b6" />
          ))}
          {stamp > 0 ? (
            <g transform={`translate(1110 760) rotate(-14) scale(${stamp})`} opacity={Math.min(1, (2.2 - stamp) * 2)}>
              <rect x={-230} y={-70} width={460} height={140} rx={14} fill="none" stroke={C.blood} strokeWidth={10} />
              <text x={0} y={-6} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={C.blood}>
                ĐÃ THÔNG QUA
              </text>
              <text x={0} y={50} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.blood}>
                7/8/1964
              </text>
            </g>
          ) : null}
        </g>
      </g>
      {/* mặt ngăn kéo */}
      <g transform={`translate(0 ${open * 300})`}>
        <rect x={200} y={720} width={1520} height={380} fill={C.wood} {...s6} />
        <rect x={860} y={820} width={200} height={40} rx={20} fill="#c9a24a" {...s6} />
      </g>
    </svg>
  );
};
