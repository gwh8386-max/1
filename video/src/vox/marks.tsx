import React from 'react';
import {Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../lib/fonts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MARKER = '#d42a1c';

export type Str = {a: [number, number]; b: [number, number]; from: number; to: number; sag?: number};

/**
 * Dây đỏ nối các manh mối (vẽ trong toạ độ thế giới), tự kéo từ a sang b.
 * Đặt lớp này phía trên các mảnh giấy.
 */
export const Strings: React.FC<{items: Str[]; width: number; height: number}> = ({items, width, height}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {items.map((s, i) => {
        const p = interpolate(frame, [s.from, s.to], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
        if (p <= 0) {
          return null;
        }
        const [ax, ay] = s.a;
        const [bx, by] = s.b;
        const len = Math.hypot(bx - ax, by - ay);
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2 + (s.sag ?? 0.07) * len;
        const d = `M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`;
        // điểm đầu dây đang kéo tới (trên đường cong bậc hai)
        const q = (t: number) => [(1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx, (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by];
        const [hx, hy] = q(p);
        return (
          <g key={i}>
            <path d={d} pathLength={1} strokeDasharray={`${p} 1`} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={7} transform="translate(5 9)" />
            <path d={d} pathLength={1} strokeDasharray={`${p} 1`} fill="none" stroke="#b5221a" strokeWidth={6} strokeLinecap="round" />
            <path d={d} pathLength={1} strokeDasharray={`${p} 1`} fill="none" stroke="#e8564a" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
            <circle cx={ax} cy={ay} r={13} fill="#c0261b" stroke="#1a1a1a" strokeWidth={3} />
            <circle cx={hx} cy={hy} r={p >= 1 ? 13 : 7} fill="#c0261b" stroke="#1a1a1a" strokeWidth={3} />
          </g>
        );
      })}
    </svg>
  );
};

export type Mark =
  | {kind: 'circle'; cx: number; cy: number; rx: number; ry: number; at: number; dur?: number; seed?: string; width?: number}
  | {kind: 'underline'; x1: number; x2: number; y: number; at: number; dur?: number; width?: number}
  | {kind: 'arrow'; from: [number, number]; to: [number, number]; bend?: number; at: number; dur?: number; width?: number}
  | {kind: 'cross'; cx: number; cy: number; r: number; at: number; dur?: number; width?: number};

const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed: string) => {
  const pts: string[] = [];
  const a0 = -0.5;
  const total = Math.PI * 2 * 1.12; // vẽ lố một chút như tay người
  for (let i = 0; i <= 64; i++) {
    const a = a0 + (i / 64) * total;
    const k = 1 + 0.05 * Math.sin(a * 3 + random(seed) * 6) + 0.04 * (i / 64);
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};

/** Nét bút dạ đỏ vẽ tay: khoanh tròn, gạch chân, mũi tên, gạch chéo. Toạ độ thế giới. */
export const Marks: React.FC<{items: Mark[]; width: number; height: number}> = ({items, width, height}) => {
  const frame = useCurrentFrame();
  const draw = (d: string, at: number, dur: number, w: number, key: string) => {
    const p = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
    if (p <= 0) {
      return null;
    }
    return <path key={key} d={d} pathLength={1} strokeDasharray={`${p} 1`} fill="none" stroke={MARKER} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />;
  };
  return (
    <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {items.map((m, i) => {
        const w = m.width ?? 10;
        const dur = m.dur ?? 12;
        if (m.kind === 'circle') {
          return draw(roughEllipse(m.cx, m.cy, m.rx, m.ry, m.seed ?? `c${i}`), m.at, dur, w, `m${i}`);
        }
        if (m.kind === 'underline') {
          const d = `M ${m.x1} ${m.y} Q ${(m.x1 + m.x2) / 2} ${m.y + 14} ${m.x2} ${m.y - 6}`;
          return draw(d, m.at, dur, w, `m${i}`);
        }
        if (m.kind === 'cross') {
          return (
            <g key={`m${i}`}>
              {draw(`M ${m.cx - m.r} ${m.cy - m.r} L ${m.cx + m.r} ${m.cy + m.r}`, m.at, dur / 2, w, 'a')}
              {draw(`M ${m.cx + m.r} ${m.cy - m.r} L ${m.cx - m.r} ${m.cy + m.r}`, m.at + dur / 2, dur / 2, w, 'b')}
            </g>
          );
        }
        const [ax, ay] = m.from;
        const [bx, by] = m.to;
        const bend = m.bend ?? 0.25;
        const cx = (ax + bx) / 2 - (by - ay) * bend;
        const cy = (ay + by) / 2 + (bx - ax) * bend;
        const ang = Math.atan2(by - cy, bx - cx);
        const hl = 34;
        const h1 = `M ${bx} ${by} L ${bx - hl * Math.cos(ang - 0.5)} ${by - hl * Math.sin(ang - 0.5)}`;
        const h2 = `M ${bx} ${by} L ${bx - hl * Math.cos(ang + 0.5)} ${by - hl * Math.sin(ang + 0.5)}`;
        return (
          <g key={`m${i}`}>
            {draw(`M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`, m.at, dur, w, 'body')}
            {draw(h1, m.at + dur, 4, w, 'h1')}
            {draw(h2, m.at + dur + 2, 4, w, 'h2')}
          </g>
        );
      })}
    </svg>
  );
};

/** Chữ viết tay bằng bút dạ, hiện dần từ trái sang phải như đang viết. */
export const HandLabel: React.FC<{x: number; y: number; text: string; at: number; dur?: number; size?: number; rot?: number; color?: string; font?: string}> = ({
  x,
  y,
  text,
  at,
  dur = 14,
  size = 64,
  rot = -4,
  color = MARKER,
  font = FONT.marker,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  if (p <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${rot}deg)`,
        fontFamily: font,
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`,
        textShadow: '2px 3px 0 rgba(0,0,0,0.25)',
      }}
    >
      {text}
    </div>
  );
};

/** Con dấu cao su: đập xuống (phóng to rồi chạm), mực loang lổ. */
export const Stamp: React.FC<{x: number; y: number; text: string; sub?: string; at: number; rot?: number; color?: string; size?: number}> = ({
  x,
  y,
  text,
  sub,
  at,
  rot = -12,
  color = '#c8281e',
  size = 90,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) {
    return null;
  }
  const k = interpolate(frame - at, [0, 4, 7], [2.4, 0.94, 1], clamp);
  const mask = `url(${staticFile('vox/stamp-mask.png')})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${k})`,
        opacity: interpolate(frame - at, [0, 2], [0.3, 0.92], clamp),
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: '420px 420px',
        maskSize: '420px 420px',
      }}
    >
      <div
        style={{
          border: `${size * 0.08}px solid ${color}`,
          outline: `${size * 0.035}px solid ${color}`,
          outlineOffset: size * 0.06,
          padding: `${size * 0.08}px ${size * 0.3}px`,
          color,
          fontFamily: FONT.display,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: size * 0.05,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
        {sub ? <div style={{fontSize: size * 0.38, letterSpacing: size * 0.04, marginTop: size * 0.06}}>{sub}</div> : null}
      </div>
    </div>
  );
};
