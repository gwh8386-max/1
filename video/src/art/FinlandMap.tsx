import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {Arrow, LL, MapArrow, MapMarker, Marker, smooth, toD, XY} from './Map';

// Bản đồ Phần Lan 1939–40 (đường biên giản lược, đủ để kể chuyện, không dùng để đo đạc).
const LON0 = 15.5;
const LON1 = 37.5;
const LAT0 = 58.6;
const LAT1 = 70.4;
const KX = Math.cos((64 * Math.PI) / 180);

/** Phép chiếu cho khung w x h: giữ đúng tỉ lệ ở vĩ độ ~64°B, căn giữa. */
export const finProj = (w: number, h: number) => {
  const sx = w / ((LON1 - LON0) * KX);
  const sy = h / (LAT1 - LAT0);
  const k = Math.min(sx, sy);
  const ox = (w - (LON1 - LON0) * KX * k) / 2;
  const oy = (h - (LAT1 - LAT0) * k) / 2;
  return (lon: number, lat: number): XY => [ox + (lon - LON0) * KX * k, oy + (LAT1 - lat) * k];
};

// Phần Lan trước chiến tranh (đi theo chiều kim đồng hồ từ Hanko).
const FINLAND: LL[] = [
  [22.9, 59.8], [25.0, 60.2], [26.9, 60.45], [28.7, 60.6], [29.9, 60.15], [31.0, 60.5], [32.3, 61.3], [32.9, 61.6], [33.1, 62.2],
  [32.6, 62.8], [31.6, 63.0], [30.6, 63.6], [30.0, 64.0], [30.5, 64.6], [29.7, 65.1], [30.1, 66.0], [29.1, 66.8],
  [29.6, 67.6], [28.6, 68.2], [28.5, 68.9], [30.0, 69.1], [31.0, 69.5], [31.8, 69.8], [29.0, 69.95], [27.5, 70.05],
  [26.5, 69.9], [25.8, 69.4], [25.0, 68.6], [23.5, 68.8], [22.3, 68.7], [21.0, 69.25], [20.55, 69.05], [21.5, 68.4],
  [23.6, 67.9], [23.6, 66.6], [24.15, 65.85], [25.4, 65.0], [24.5, 64.7], [23.1, 63.85], [21.6, 63.1], [21.8, 61.5],
  [21.5, 61.1], [22.2, 60.45],
];
// Biển: vịnh Bothnia + vịnh Phần Lan + biển Baltic phía nam.
const SEA: LL[] = [
  [14.0, 57.0], [16.6, 58.6], [17.5, 60.5], [18.5, 62.5], [20.5, 63.8], [21.8, 65.0], [22.2, 65.6], [24.15, 65.85],
  [25.4, 65.0], [24.5, 64.7], [23.1, 63.85], [21.6, 63.1], [21.8, 61.5], [21.5, 61.1], [22.2, 60.45], [22.9, 59.8],
  [25.0, 60.2], [26.9, 60.45], [28.7, 60.6], [29.9, 60.15], [30.3, 59.93], [28.0, 59.45], [26.0, 59.55], [23.5, 59.2],
  [21.8, 57.5], [20.0, 57.0],
];
const LADOGA: LL[] = [
  [30.7, 61.5], [31.6, 61.65], [32.4, 61.3], [32.9, 60.8], [32.6, 60.3], [31.6, 60.0], [31.0, 60.0], [30.5, 60.25],
  [30.2, 60.7], [30.3, 61.2],
];
const ONEGA: LL[] = [[34.5, 62.6], [35.6, 62.5], [36.2, 61.6], [35.3, 61.1], [34.6, 61.5], [34.3, 62.1]];
// Vùng đất phải nhường theo Hiệp ước Moskva 1940 (Karelia, giản lược).
const CEDED: LL[] = [
  [27.8, 60.52], [28.4, 61.0], [29.3, 61.35], [29.9, 61.62], [30.7, 62.1], [31.5, 62.5], [32.6, 62.8], [33.1, 62.2],
  [32.9, 61.6], [32.3, 61.3], [31.0, 60.5], [29.9, 60.15], [28.7, 60.6],
];
const SALLA: LL[] = [[28.6, 66.2], [29.9, 66.3], [30.1, 66.0], [29.7, 65.1], [29.3, 65.6]];

export const PLACES: Record<string, LL> = {
  helsinki: [24.94, 60.17],
  kollaa: [32.15, 62.05],
  rautjarvi: [29.1, 61.3],
  ladoga: [31.6, 60.85],
  hamina: [27.2, 60.57],
  viipuri: [28.75, 60.71],
  leningrad: [30.3, 59.93],
  suomussalmi: [28.9, 64.9],
  salla: [28.7, 66.8],
  petsamo: [31.2, 69.4],
  sweden: [18.8, 64.5],
};

export const FinlandMap: React.FC<{
  w: number;
  h: number;
  arrows?: MapArrow[];
  markers?: MapMarker[];
  ceded?: number; // khung frame bắt đầu hiện vùng đất bị cắt
  labels?: boolean;
  focusFinland?: number; // frame tô sáng Phần Lan
}> = ({w, h, arrows = [], markers = [], ceded, labels = true, focusFinland}) => {
  const frame = useCurrentFrame();
  const P = finProj(w, h);
  const poly = (pts: LL[], steps = 4) => toD(smooth([...pts, pts[0]].map(([a, b]) => P(a, b)), steps), true);
  const cedK = ceded !== undefined ? interpolate(frame, [ceded, ceded + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const glow = focusFinland !== undefined ? interpolate(frame, [focusFinland, focusFinland + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const lab = (t: string, ll: LL, size: number, opts: {sea?: boolean; color?: string; dx?: number; dy?: number} = {}) => {
    const [x, y] = P(...ll);
    return (
      <text
        key={t}
        x={x + (opts.dx ?? 0)}
        y={y + (opts.dy ?? 0)}
        textAnchor="middle"
        fontFamily={opts.sea ? 'Be Vietnam Pro' : 'Anton'}
        fontStyle={opts.sea ? 'italic' : 'normal'}
        fontWeight={opts.sea ? 800 : 400}
        letterSpacing={opts.sea ? 8 : 3}
        fontSize={size}
        fill={opts.color ?? (opts.sea ? '#3f6f86' : '#5d5547')}
        opacity={0.85}
      >
        {t}
      </text>
    );
  };
  const grid: React.ReactNode[] = [];
  for (let lon = 16; lon <= 37; lon += 2) {
    const [x0, y0] = P(lon, LAT0 - 1);
    const [x1, y1] = P(lon, LAT1 + 1);
    grid.push(<line key={`o${lon}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.ink} strokeWidth={1.5} opacity={0.1} />);
  }
  for (let lat = 59; lat <= 70; lat++) {
    const [x0, y0] = P(LON0 - 2, lat);
    const [x1, y1] = P(LON1 + 2, lat);
    grid.push(<line key={`a${lat}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.ink} strokeWidth={1.5} opacity={0.1} />);
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id="finHatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="22" height="22" fill="rgba(200,40,30,0.28)" />
          <line x1="0" y1="0" x2="0" y2="22" stroke={C.blood} strokeWidth="8" />
        </pattern>
      </defs>
      {/* nền: đất các nước láng giềng */}
      <rect width={w} height={h} fill="#d9cfb8" />
      <path d={poly(SEA, 3)} fill="#a9c6d2" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      {grid}
      <path d={poly(FINLAND)} fill={glow > 0 ? `rgb(${245 - 10 * glow},${240 - 8 * glow},${226 - 20 * glow})` : '#f3eee0'} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {cedK > 0 ? (
        <g opacity={cedK}>
          <path d={poly(CEDED, 3)} fill="url(#finHatch)" stroke={C.blood} strokeWidth={5} strokeDasharray="14 8" />
          <path d={poly(SALLA, 3)} fill="url(#finHatch)" stroke={C.blood} strokeWidth={5} strokeDasharray="14 8" />
        </g>
      ) : null}
      <path d={poly(LADOGA, 4)} fill="#a9c6d2" stroke={C.ink} strokeWidth={4} />
      <path d={poly(ONEGA, 4)} fill="#a9c6d2" stroke={C.ink} strokeWidth={4} />
      {labels ? (
        <g>
          {lab('FINLAND', [26.2, 63.4], 64, {color: C.ink})}
          {lab('SOVIET UNION', [34.0, 65.2], 52, {color: '#7a2a20'})}
          {lab('SWEDEN', PLACES.sweden, 44)}
          {lab('NORWAY', [21.5, 69.9], 34)}
          {lab('ESTONIA', [26.0, 58.9], 32)}
          {lab('GULF OF BOTHNIA', [20.2, 62.4], 24, {sea: true})}
          {lab('GULF OF FINLAND', [25.6, 59.85], 22, {sea: true})}
          {lab('LADOGA', [31.6, 60.85], 22, {sea: true})}
        </g>
      ) : null}
      {arrows.map((a, i) => (
        <Arrow key={i} a={a} proj={P} font={30} />
      ))}
      {markers.map((m, i) => (
        <Marker key={i} m={m} proj={P} />
      ))}
    </svg>
  );
};
