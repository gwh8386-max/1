import React from 'react';
import {random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';

export type Enter = 'drop' | 'left' | 'right' | 'up' | 'down' | 'none';
export type Texture = 'paper' | 'kraft' | 'sticky' | 'check' | 'white' | 'none';

const TEX: Record<Texture, string | null> = {
  paper: 'vox/paper.png',
  kraft: 'vox/kraft.png',
  sticky: 'vox/sticky.png',
  check: 'vox/check.png',
  white: null,
  none: null,
};

/** Mép giấy xé: đa giác răng cưa ngẫu nhiên (tính theo %, nên co giãn theo kích thước). */
export const tornPolygon = (w: number, h: number, seed: string, amp = 7, step = 18, edges = 'trbl') => {
  const pts: [number, number][] = [];
  const j = (k: string) => (random(`${seed}${k}`) - 0.5) * 2 * amp;
  const nx = Math.max(2, Math.round(w / step));
  const ny = Math.max(2, Math.round(h / step));
  for (let i = 0; i <= nx; i++) pts.push([(i / nx) * w, edges.includes('t') ? amp + j(`t${i}`) : 0]);
  for (let i = 1; i <= ny; i++) pts.push([edges.includes('r') ? w - amp + j(`r${i}`) : w, (i / ny) * h]);
  for (let i = nx - 1; i >= 0; i--) pts.push([(i / nx) * w, edges.includes('b') ? h - amp + j(`b${i}`) : h]);
  for (let i = ny - 1; i >= 1; i--) pts.push([edges.includes('l') ? amp + j(`l${i}`) : 0, (i / ny) * h]);
  return `polygon(${pts.map(([x, y]) => `${((x / w) * 100).toFixed(2)}% ${((y / h) * 100).toFixed(2)}%`).join(',')})`;
};

/** Đinh ghim đầu tròn đỏ. */
export const Pin: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#c0261b'}) => (
  <svg width={60 * s} height={60 * s} viewBox="0 0 60 60" style={{position: 'absolute', left: x - 30 * s, top: y - 30 * s, overflow: 'visible'}}>
    <ellipse cx={36} cy={40} rx={12} ry={6} fill="rgba(0,0,0,0.35)" />
    <circle cx={30} cy={28} r={15} fill={color} stroke={C.ink} strokeWidth={3} />
    <circle cx={25} cy={22} r={5} fill="#ffffff" opacity={0.55} />
  </svg>
);

/** Miếng băng dính giấy, hai đầu răng cưa. */
export const Tape: React.FC<{x: number; y: number; w?: number; rot?: number; seed?: string}> = ({x, y, w = 170, rot = -30, seed = 'tp'}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - 22,
      width: w,
      height: 44,
      background: 'rgba(236, 226, 190, 0.78)',
      transform: `rotate(${rot}deg)`,
      clipPath: tornPolygon(w, 44, seed, 4, 9, 'lr'),
      boxShadow: 'inset 0 0 12px rgba(120,100,60,0.25)',
    }}
  />
);

/**
 * Mảnh giấy cắt dán: xé mép, có bóng đổ, đập xuống (drop) hoặc trượt vào từ một phía.
 * Đặt trong toạ độ thế giới (px). `children` vẽ trong khung w x h.
 */
export const Cutout: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  at?: number;
  enter?: Enter;
  tear?: string | false;
  texture?: Texture;
  pad?: number;
  pin?: boolean;
  tape?: boolean;
  seed?: string;
  shadow?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, h, rot = 0, at, enter = 'drop', tear = 'trbl', texture = 'paper', pad = 0, pin = false, tape = false, seed = `${x},${y}`, shadow = 1, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (at !== undefined && frame < at) {
    return null;
  }
  const s = at === undefined || enter === 'none' ? 1 : spring({frame: frame - at, fps, config: {damping: 15, stiffness: 170, mass: 0.8}});
  const lift = 1 - s;
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let r = rot;
  if (enter === 'drop') {
    scale = 1 + 0.28 * lift;
    r = rot + 8 * lift;
  } else if (enter !== 'none') {
    const d = 2200 * lift;
    tx = enter === 'left' ? -d : enter === 'right' ? d : 0;
    ty = enter === 'up' ? -d : enter === 'down' ? d : 0;
    r = rot - 12 * lift;
  }
  const tex = TEX[texture];
  const sh = shadow * (1 + 1.6 * lift);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translate(${tx}px, ${ty}px) rotate(${r}deg) scale(${scale})`,
        filter: `drop-shadow(${7 * sh}px ${12 * sh}px ${10 * sh}px rgba(0,0,0,0.55))`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: tear ? tornPolygon(w, h, seed, 7, 18, tear) : undefined,
          background: texture === 'none' ? undefined : texture === 'white' ? '#fbfaf6' : `url(${staticFile(tex!)})`,
          backgroundSize: '512px 512px',
          overflow: 'hidden',
          padding: pad,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
      {tape ? (
        <>
          <Tape x={22} y={10} rot={-35} seed={`${seed}a`} />
          <Tape x={w - 22} y={10} rot={35} seed={`${seed}b`} />
        </>
      ) : null}
      {pin ? <Pin x={w / 2} y={18} /> : null}
    </div>
  );
};

/** Nhúng một cảnh khổ 1920x1080 vào khung w x h (phủ kín, căn giữa). */
export const Fit169: React.FC<{w: number; h: number; children: React.ReactNode; focusY?: number}> = ({w, h, children, focusY = 0.5}) => {
  const k = Math.max(w / 1920, h / 1080);
  return (
    <div style={{position: 'absolute', left: (w - 1920 * k) / 2, top: (h - 1080 * k) * focusY, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: '0 0'}}>
      {children}
    </div>
  );
};

/** Xử lý ảnh kiểu tư liệu cũ: ngả màu, chấm in (halftone), tối mép. */
export const Aged: React.FC<{children: React.ReactNode; sepia?: number; gray?: number; dots?: number}> = ({children, sepia = 0.35, gray = 0, dots = 0.22}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <div style={{position: 'absolute', inset: 0, filter: `sepia(${sepia}) grayscale(${gray}) contrast(1.08)`}}>{children}</div>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.9) 1.1px, transparent 1.7px)',
        backgroundSize: '7px 7px',
        mixBlendMode: 'multiply',
        opacity: dots,
      }}
    />
    <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(40,25,10,0.55)'}} />
  </div>
);

/** Ảnh polaroid: khung trắng, chú thích viết tay. */
export const Polaroid: React.FC<{x: number; y: number; w: number; h: number; rot?: number; at?: number; enter?: Enter; caption: string; children: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  rot = 0,
  at,
  enter = 'drop',
  caption,
  children,
}) => (
  <Cutout x={x} y={y} w={w} h={h} rot={rot} at={at} enter={enter} tear={false} texture="white" pin>
    <div style={{position: 'absolute', left: 24, top: 24, right: 24, bottom: 110, overflow: 'hidden', background: '#111'}}>{children}</div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontFamily: FONT.script, fontWeight: 700, fontSize: 52, color: '#28303d'}}>{caption}</div>
  </Cutout>
);

/** Giấy nhớ vàng có chữ viết tay. */
export const Sticky: React.FC<{x: number; y: number; text: string; rot?: number; at?: number; size?: number; w?: number}> = ({x, y, text, rot = -4, at, size = 50, w = 300}) => (
  <Cutout x={x} y={y} w={w} h={w} rot={rot} at={at} enter="drop" tear={false} texture="sticky" shadow={0.7}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT.script,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.05,
        color: '#2a2a33',
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 70%, rgba(120,90,0,0.12) 100%)',
      }}
    >
      {text}
    </div>
  </Cutout>
);

/** Nhãn chữ đánh máy trên dải giấy, dán băng dính một đầu. */
export const TypedTag: React.FC<{x: number; y: number; text: string; rot?: number; at?: number; w?: number; color?: string; size?: number}> = ({
  x,
  y,
  text,
  rot = -5,
  at,
  w = 700,
  color = C.ink,
  size = 54,
}) => (
  <Cutout x={x} y={y} w={w} h={size * 2.1} rot={rot} at={at} enter="drop" tear="lr" texture="paper" tape>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.typewriter, fontSize: size, color, letterSpacing: 2}}>
      {text}
    </div>
  </Cutout>
);
