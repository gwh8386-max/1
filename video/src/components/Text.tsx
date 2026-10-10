import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';

/** Viền chữ bằng nhiều lớp bóng (ổn định trên mọi trình duyệt khi render). */
export const outline = (px: number, color: string = C.ink, drop = true) => {
  const parts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    parts.push(`${(Math.cos(a) * px).toFixed(1)}px ${(Math.sin(a) * px).toFixed(1)}px 0 ${color}`);
  }
  if (drop) {
    parts.push(`${px * 0.6}px ${px * 1.1}px 0 ${color}`);
  }
  return parts.join(',');
};

type Pos = {x: number; y: number};

/** Chữ "đập" vào màn hình: phóng to rồi bật về, hơi xoay, có thể biến mất. */
export const PunchText: React.FC<
  Pos & {
    text: string;
    at: number;
    out?: number;
    size?: number;
    color?: string;
    rotate?: number;
    stroke?: number;
    align?: 'left' | 'center' | 'right';
    font?: string;
    maxWidth?: number;
  }
> = ({text, at, out, x, y, size = 140, color = C.white, rotate = -3, stroke = 8, align = 'center', font = FONT.display, maxWidth = 1700}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || (out !== undefined && frame > out + 10)) {
    return null;
  }
  const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
  const scale = interpolate(s, [0, 1], [2.1, 1]);
  const exit = out !== undefined ? interpolate(frame, [out, out + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) rotate(${rotate * (2 - s)}deg) scale(${scale * (0.85 + 0.15 * exit)})`,
        opacity: Math.min(1, s * 3) * exit,
        fontFamily: font,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textShadow: outline(stroke),
        textAlign: align,
        whiteSpace: 'pre-line',
        maxWidth,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  );
};

/** Thẻ tên nhân vật ở góc trên trái, có vạch gạch chân tự vẽ ra. */
export const NameTag: React.FC<{name: string; sub?: string; at: number; out?: number; x?: number; y?: number}> = ({
  name,
  sub,
  at,
  out,
  x = 70,
  y = 60,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) {
    return null;
  }
  const s = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 140}});
  const bar = interpolate(frame - at, [6, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const exit = out !== undefined ? interpolate(frame, [out, out + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: exit, transform: `translateX(${(1 - s) * -80}px)`}}>
      <div style={{fontFamily: FONT.display, fontSize: 96, color: C.white, textShadow: outline(7), lineHeight: 1}}>{name}</div>
      <div style={{height: 12, width: `${bar * 100}%`, background: C.mustard, border: `4px solid ${C.ink}`, marginTop: 8, borderRadius: 3}} />
      {sub ? (
        <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 40, color: C.white, textShadow: outline(5, C.ink, false), marginTop: 10, opacity: bar}}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** Nhãn mốc thời gian / địa điểm, hiện từng ký tự. */
export const DateStamp: React.FC<{text: string; at: number; out?: number; corner?: 'tl' | 'tr' | 'bl'; color?: string}> = ({
  text,
  at,
  out,
  corner = 'tl',
  color = C.rust,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) {
    return null;
  }
  const n = Math.floor(interpolate(frame - at, [0, text.length * 1.4], [0, text.length], {extrapolateRight: 'clamp'}));
  const exit = out !== undefined ? interpolate(frame, [out, out + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const pos: React.CSSProperties = corner === 'tl' ? {left: 70, top: 64} : corner === 'tr' ? {right: 70, top: 64} : {left: 70, bottom: 90};
  return (
    <div
      style={{
        position: 'absolute',
        ...pos,
        opacity: exit,
        fontFamily: FONT.display,
        fontSize: 64,
        color: C.white,
        background: color,
        border: `5px solid ${C.ink}`,
        padding: '6px 22px 10px',
        boxShadow: `6px 8px 0 ${C.ink}`,
        transform: 'rotate(-1.5deg)',
        letterSpacing: 2,
      }}
    >
      {text.slice(0, n)}
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </div>
  );
};

/** Ruy băng tiêu đề (địa danh, sự kiện). */
export const Banner: React.FC<{text: string; at: number; out?: number; y?: number; size?: number}> = ({text, at, out, y = 120, size = 64}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  if (frame < at) {
    return null;
  }
  const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 120}});
  const exit = out !== undefined ? interpolate(frame, [out, out + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const w = Math.min(width - 160, text.length * size * 0.55 + 160);
  return (
    <div style={{position: 'absolute', left: width / 2, top: y, transform: `translate(-50%, -50%) scaleX(${s})`, opacity: exit}}>
      <svg width={w + 120} height={size * 2.1} viewBox={`0 0 ${w + 120} ${size * 2.1}`} style={{position: 'absolute', left: -60, top: 0}}>
        <path d={`M 0 ${size * 0.5} L 70 ${size * 0.5} L 70 ${size * 1.9} L 0 ${size * 1.9} L 30 ${size * 1.2} Z`} fill="#e9e1cf" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${w + 120} ${size * 0.5} L ${w + 50} ${size * 0.5} L ${w + 50} ${size * 1.9} L ${w + 120} ${size * 1.9} L ${w + 90} ${size * 1.2} Z`} fill="#e9e1cf" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={50} y={size * 0.2} width={w + 20} height={size * 1.45} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      </svg>
      <div style={{position: 'relative', width: w, height: size * 1.85, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontSize: size, color: C.ink, paddingBottom: size * 0.22}}>
        {text}
      </div>
    </div>
  );
};

/** Chữ đánh máy: hiện dần từng ký tự trong khoảng [from, to]. */
export const Typewriter: React.FC<{text: string; from: number; to: number; size?: number; color?: string; style?: React.CSSProperties}> = ({
  text,
  from,
  to,
  size = 46,
  color = C.ink,
  style,
}) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [from, to], [0, text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const caret = frame >= from && Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: size, color, whiteSpace: 'pre-wrap', ...style}}>
      {text.slice(0, n)}
      <span style={{opacity: caret && n < text.length ? 1 : 0}}>▌</span>
    </div>
  );
};

/** Số đếm có hiệu ứng lật. */
export const Counter: React.FC<
  Pos & {from: number; to: number; start: number; end: number; size?: number; color?: string; prefix?: string; suffix?: string}
> = ({from, to, start, end, x, y, size = 200, color = C.white, prefix = '', suffix = ''}) => {
  const frame = useCurrentFrame();
  if (frame < start) {
    return null;
  }
  const v = interpolate(frame, [start, end], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const n = Math.round(v);
  const flip = v - Math.floor(v);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scaleY(${frame < end ? 1 - 0.18 * Math.sin(flip * Math.PI) : 1})`,
        fontFamily: FONT.display,
        fontSize: size,
        color,
        textShadow: outline(9),
        lineHeight: 1,
      }}
    >
      {prefix}
      {n}
      {suffix}
    </div>
  );
};

/** Phụ đề (dùng cho bản nháp chưa có giọng, hoặc bật khi cần). Chữ đang đọc được tô vàng. */
export const Subtitle: React.FC<{words: {w: string; s: number; e: number}[]; tSec: number}> = ({words, tSec}) => {
  if (!words.length) {
    return null;
  }
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 54, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          maxWidth: 1500,
          textAlign: 'center',
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.3,
          color: C.white,
          background: 'rgba(10,10,12,0.72)',
          padding: '10px 26px 12px',
          borderRadius: 12,
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{color: tSec >= w.s ? (tSec <= w.e + 0.05 ? C.mustard : C.white) : 'rgba(255,255,255,0.55)'}}>
            {w.w}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};
