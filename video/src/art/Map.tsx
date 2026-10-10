import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {H, W} from './common';

// Khung bản đồ theo kinh/vĩ độ: tỉ lệ ngang/dọc gần đúng ở vĩ độ ~19°B.
const LON0 = 102.5;
const LON1 = 113.4;
const LAT0 = 16.5;
const LAT1 = 22.3;

type LL = [number, number]; // [kinh độ, vĩ độ]
type XY = [number, number];

export const geo = (lon: number, lat: number): XY => [((lon - LON0) / (LON1 - LON0)) * W, ((LAT1 - lat) / (LAT1 - LAT0)) * H];

/** Điểm trên bản đồ tính theo % khung (để đặt tâm zoom của máy quay). */
export const geoPct = (lon: number, lat: number): XY => {
  const [x, y] = geo(lon, lat);
  return [(x / W) * 100, (y / H) * 100];
};

/** Làm mượt đường gấp khúc bằng spline Catmull-Rom. */
const smooth = (pts: XY[], steps = 10): XY[] => {
  if (pts.length < 3) {
    return pts;
  }
  const out: XY[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const toD = (pts: XY[], close = false) => `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')}${close ? ' Z' : ''}`;

// Bờ biển từ phía đông (Quảng Đông) vòng qua bán đảo Lôi Châu, dọc bờ biển Việt Nam xuống phía nam.
const COAST: LL[] = [
  [114.0, 22.3], [113.4, 22.2], [112.6, 21.9], [111.8, 21.65], [111.0, 21.45], [110.6, 21.25], [110.45, 20.9],
  [110.55, 20.5], [110.35, 20.28], [110.15, 20.25], [109.95, 20.45], [109.85, 20.8], [109.7, 21.2], [109.55, 21.45],
  [109.1, 21.45], [108.7, 21.65], [108.35, 21.6], [108.0, 21.52], [107.6, 21.3], [107.35, 21.15], [107.1, 20.95],
  [106.8, 20.85], [106.62, 20.6], [106.55, 20.25], [106.2, 19.98], [105.95, 19.8], [105.82, 19.35], [105.72, 18.85],
  [105.85, 18.55], [106.1, 18.3], [106.38, 18.0], [106.62, 17.5], [106.95, 17.15], [107.15, 16.95], [107.5, 16.7],
  [107.85, 16.45], [108.2, 16.1],
];
const HAINAN: LL[] = [
  [110.2, 20.1], [110.7, 20.0], [111.05, 19.65], [110.95, 19.2], [110.6, 18.75], [110.1, 18.45], [109.5, 18.2],
  [108.95, 18.4], [108.65, 18.8], [108.62, 19.2], [108.9, 19.6], [109.25, 19.85], [109.65, 19.98],
];
const BORDER_CN: LL[] = [[108.0, 21.52], [107.5, 21.65], [107.0, 21.9], [106.7, 22.05], [106.3, 22.4]];
const BORDER_LA: LL[] = [
  [102.7, 22.4], [102.9, 21.4], [103.7, 20.8], [104.4, 20.5], [104.9, 20.0], [104.2, 19.6], [104.6, 19.0],
  [105.2, 18.6], [105.6, 18.2], [105.9, 17.8], [106.3, 17.3], [106.6, 16.9], [106.9, 16.4],
];

type Label = {t: string; ll: LL; size?: number; sea?: boolean; dot?: boolean; anchor?: 'start' | 'middle' | 'end'; dx?: number; dy?: number};
const LABELS: Label[] = [
  {t: 'TRUNG QUỐC', ll: [110.6, 22.0], size: 46},
  {t: 'LÀO', ll: [103.7, 19.0], size: 46},
  {t: 'ĐẢO HẢI NAM', ll: [109.85, 19.15], size: 34},
  {t: 'VỊNH BẮC BỘ', ll: [108.0, 18.5], size: 54, sea: true},
  {t: 'HÀ NỘI', ll: [105.85, 21.03], size: 32, dot: true, anchor: 'end', dx: -14, dy: 10},
  {t: 'HẢI PHÒNG', ll: [106.68, 20.86], size: 28, dot: true, anchor: 'start', dx: 14, dy: 10},
  {t: 'VINH', ll: [105.68, 18.67], size: 28, dot: true, anchor: 'end', dx: -14, dy: 10},
  {t: 'ĐỒNG HỚI', ll: [106.6, 17.48], size: 26, dot: true, anchor: 'end', dx: -14, dy: 8},
];

export type MapArrow = {pts: LL[]; from: number; to: number; color?: string; width?: number; label?: string; labelAt?: number};
export type MapMarker = {ll: LL; at: number; kind?: 'pulse' | 'burst' | 'dot'; color?: string; label?: string; labelSide?: 'left' | 'right'; size?: number};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Mũi tên tự vẽ dọc theo đường đi, đầu mũi tên luôn ở điểm đang vẽ tới. */
const Arrow: React.FC<{a: MapArrow}> = ({a}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [a.from, a.to], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  if (p <= 0) {
    return null;
  }
  const pts = smooth(a.pts.map(([lo, la]) => geo(lo, la)), 12);
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((s, v) => s + v, 0);
  let left = total * p;
  const drawn: XY[] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i]);
    drawn.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    left -= seg[i];
  }
  const tip = drawn[drawn.length - 1];
  const prev = drawn[Math.max(0, drawn.length - 3)];
  const ang = (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
  const w = a.width ?? 10;
  const col = a.color ?? C.navyDark;
  const labelK = a.label ? interpolate(frame, [a.labelAt ?? a.to, (a.labelAt ?? a.to) + 8], [0, 1], clamp) : 0;
  return (
    <g>
      <path d={toD(drawn)} fill="none" stroke={C.ink} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={toD(drawn)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang}) scale(${Math.min(1, p * 6)})`}>
        <path d={`M ${w * 2.6} 0 L ${-w * 1.2} ${-w * 2} L ${-w * 0.4} 0 L ${-w * 1.2} ${w * 2} Z`} fill={col} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {labelK > 0 ? (
        <text x={tip[0] + 30} y={tip[1] + 56} fontFamily="Anton" fontSize={34} fill={col} stroke={C.paper} strokeWidth={8} paintOrder="stroke" opacity={labelK}>
          {a.label}
        </text>
      ) : null}
    </g>
  );
};

const Marker: React.FC<{m: MapMarker}> = ({m}) => {
  const frame = useCurrentFrame();
  if (frame < m.at) {
    return null;
  }
  const [x, y] = geo(...m.ll);
  const k = frame - m.at;
  const pop = interpolate(k, [0, 5, 9], [0, 1.35, 1], clamp) * (m.size ?? 1);
  const col = m.color ?? C.blood;
  if (m.kind === 'burst') {
    const pts = new Array(16)
      .fill(0)
      .map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r = (i % 2 ? 22 : 52) * pop;
        return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`;
      })
      .join(' ');
    return (
      <g>
        <circle cx={x} cy={y} r={interpolate(k, [0, 18], [10, 120], clamp) * (m.size ?? 1)} fill="none" stroke={col} strokeWidth={6} opacity={interpolate(k, [0, 18], [0.9, 0], clamp)} />
        <polygon points={pts} fill={C.mustard} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={pts} fill={col} stroke="none" transform={`translate(${x} ${y}) scale(0.5) translate(${-x} ${-y})`} />
      </g>
    );
  }
  const ring = (k % 30) / 30;
  return (
    <g>
      {m.kind === 'pulse' ? <circle cx={x} cy={y} r={14 + ring * 50} fill="none" stroke={col} strokeWidth={5} opacity={1 - ring} /> : null}
      <circle cx={x} cy={y} r={13 * pop} fill={col} stroke={C.ink} strokeWidth={5} />
      {m.label ? (
        <text x={x + (m.labelSide === 'left' ? -24 : 24)} y={y + 12} textAnchor={m.labelSide === 'left' ? 'end' : 'start'} fontFamily="Anton" fontSize={32} fill={C.ink} stroke={C.paper} strokeWidth={8} paintOrder="stroke" opacity={Math.min(1, pop / (m.size ?? 1))}>
          {m.label}
        </text>
      ) : null}
    </g>
  );
};

/** Bản đồ vịnh Bắc Bộ, vẽ phẳng như bản đồ in trên giấy. */
export const GulfMap: React.FC<{arrows?: MapArrow[]; markers?: MapMarker[]; dmz?: boolean}> = ({arrows = [], markers = [], dmz = true}) => {
  const coast = smooth(COAST.map(([lo, la]) => geo(lo, la)), 6);
  const land: XY[] = [geo(101.5, 23.5), geo(114.5, 23.5), ...coast, geo(108.4, 15.5), geo(101.5, 15.5)];
  const hainan = smooth([...HAINAN, HAINAN[0]].map(([lo, la]) => geo(lo, la)), 6);
  const grid: React.ReactNode[] = [];
  for (let lon = 103; lon <= 113; lon++) {
    const [x] = geo(lon, 0);
    grid.push(<line key={`lo${lon}`} x1={x} y1={0} x2={x} y2={H} stroke={C.ink} strokeWidth={1.5} opacity={0.12} />);
  }
  for (let lat = 17; lat <= 22; lat++) {
    const [, y] = geo(0, lat);
    grid.push(<line key={`la${lat}`} x1={0} y1={y} x2={W} y2={y} stroke={C.ink} strokeWidth={1.5} opacity={0.12} />);
  }
  const [dx0, dy] = geo(106.45, 17.0);
  const [dx1] = geo(107.6, 17.0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="mapSea" cx="60%" cy="55%" r="70%">
          <stop offset="0%" stopColor="#b9d5df" />
          <stop offset="100%" stopColor="#8fb3c2" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#mapSea)" />
      {/* vệt sóng ven bờ */}
      <path d={toD(coast)} fill="none" stroke="#d6e8ee" strokeWidth={26} strokeLinejoin="round" opacity={0.7} />
      <path d={toD(hainan, true)} fill="none" stroke="#d6e8ee" strokeWidth={26} strokeLinejoin="round" opacity={0.7} />
      <path d={toD(land, true)} fill="#eadfc4" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={toD(hainan, true)} fill="#e4d8bb" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {grid}
      <path d={toD(smooth(BORDER_CN.map(([lo, la]) => geo(lo, la))))} fill="none" stroke="#8a7d68" strokeWidth={4} strokeDasharray="14 10" />
      <path d={toD(smooth(BORDER_LA.map(([lo, la]) => geo(lo, la))))} fill="none" stroke="#8a7d68" strokeWidth={4} strokeDasharray="14 10" />
      {/* đảo nhỏ: Hòn Mê, Bạch Long Vĩ, Cát Bà */}
      {([[105.92, 19.37], [107.73, 20.13], [107.0, 20.78]] as LL[]).map(([lo, la], i) => {
        const [x, y] = geo(lo, la);
        return <ellipse key={i} cx={x} cy={y} rx={10} ry={7} fill="#e4d8bb" stroke={C.ink} strokeWidth={3} />;
      })}
      {dmz ? (
        <g>
          <line x1={dx0} y1={dy} x2={dx1} y2={dy} stroke={C.rust} strokeWidth={5} strokeDasharray="16 10" />
          <text x={dx1 + 12} y={dy + 10} fontFamily="Anton" fontSize={28} fill={C.rust} stroke={C.paper} strokeWidth={7} paintOrder="stroke">
            VĨ TUYẾN 17
          </text>
        </g>
      ) : null}
      {LABELS.map((l) => {
        const [x, y] = geo(...l.ll);
        return (
          <g key={l.t}>
            {l.dot ? <circle cx={x} cy={y} r={8} fill={C.ink} stroke={C.paper} strokeWidth={3} /> : null}
            <text
              x={x + (l.dx ?? 0)}
              y={y + (l.dy ?? 0)}
              textAnchor={l.anchor ?? 'middle'}
              fontFamily={l.sea ? 'Be Vietnam Pro' : 'Anton'}
              fontWeight={l.sea ? 800 : 400}
              fontStyle={l.sea ? 'italic' : 'normal'}
              letterSpacing={l.sea ? 10 : 2}
              fontSize={l.size ?? 30}
              fill={l.sea ? '#3f6f86' : C.ink}
              stroke={l.dot ? C.paper : 'none'}
              strokeWidth={l.dot ? 6 : 0}
              paintOrder="stroke"
              opacity={l.sea ? 0.85 : 0.85}
            >
              {l.t}
            </text>
          </g>
        );
      })}
      {/* la bàn */}
      <g transform={`translate(${W - 120} ${H - 150})`}>
        <circle r={54} fill={C.paper} stroke={C.ink} strokeWidth={5} />
        <path d="M 0 -42 L 14 8 L 0 0 L -14 8 Z" fill={C.ink} />
        <path d="M 0 42 L 14 -8 L 0 0 L -14 -8 Z" fill="#b9ad93" />
        <text y={-62} textAnchor="middle" fontFamily="Anton" fontSize={30} fill={C.ink}>
          B
        </text>
      </g>
      {arrows.map((a, i) => (
        <Arrow key={i} a={a} />
      ))}
      {markers.map((m, i) => (
        <Marker key={i} m={m} />
      ))}
    </svg>
  );
};
