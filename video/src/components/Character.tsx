import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {C, STROKE} from '../lib/theme';

export type Expr = 'neutral' | 'worried' | 'scared' | 'shout' | 'stern' | 'sad' | 'blank' | 'smirk' | 'focused';
export type Hat = 'none' | 'sailor' | 'officer' | 'helmet' | 'headset' | 'officerHeadset' | 'pilot';
export type Outfit = 'sailor' | 'officer' | 'suit' | 'pilot' | 'shirt';
export type Arm = {a: number; bend?: number; len?: number};

export type CharacterProps = {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  outfit?: Outfit;
  hat?: Hat;
  hair?: 'none' | 'old' | 'short';
  glasses?: boolean;
  expr?: Expr;
  talk?: boolean;
  sweat?: boolean;
  tremble?: number;
  armL?: Arm;
  armR?: Arm;
  look?: [number, number];
  headTilt?: number;
  lean?: number;
  seed?: number;
  /** Vẽ thêm vào tay phải (toạ độ gốc tại bàn tay). */
  handR?: React.ReactNode;
  handL?: React.ReactNode;
  /** Ẩn thân và chân (cảnh cận mặt). */
  headOnly?: boolean;
};

const HEAD_Y = -232;
const HEAD_R = 64;
const SHOULDER_Y = -150;

const OUTFIT_FILL: Record<Outfit, string> = {
  sailor: C.navyShirt,
  officer: C.khaki,
  suit: C.suit,
  pilot: C.olive,
  shirt: '#d9d2c3',
};

const armPath = (side: -1 | 1, arm: Arm) => {
  const len = arm.len ?? 88;
  const sx = side * 50;
  const sy = SHOULDER_Y;
  const rad = (arm.a * Math.PI) / 180;
  const hx = sx + side * len * Math.sin(rad);
  const hy = sy + len * Math.cos(rad);
  const mx = (sx + hx) / 2;
  const my = (sy + hy) / 2;
  const nx = -(hy - sy) / len;
  const ny = (hx - sx) / len;
  const b = (arm.bend ?? 0.25) * len * 0.45 * side;
  return {d: `M ${sx} ${sy} Q ${mx + nx * b} ${my + ny * b} ${hx} ${hy}`, hx, hy};
};

const Brows: React.FC<{expr: Expr}> = ({expr}) => {
  // [trong-x, trong-y, ngoài-x, ngoài-y] cho lông mày trái; phải đối xứng.
  const table: Record<Expr, [number, number, number, number] | null> = {
    neutral: [-12, -262, -34, -262],
    worried: [-12, -270, -34, -260],
    scared: [-12, -278, -36, -268],
    shout: [-12, -276, -36, -270],
    stern: [-12, -256, -36, -266],
    sad: [-12, -268, -34, -258],
    blank: [-14, -262, -32, -262],
    smirk: [-12, -264, -34, -266],
    focused: [-12, -258, -34, -262],
  };
  const t = table[expr];
  if (!t) {
    return null;
  }
  const [ix, iy, ox, oy] = t;
  const p = {stroke: C.ink, strokeWidth: 6, strokeLinecap: 'round' as const, fill: 'none'};
  return (
    <g>
      <path d={`M ${ox} ${oy} L ${ix} ${iy}`} {...p} />
      <path d={`M ${-ox} ${oy} L ${-ix} ${iy}`} {...p} />
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; open: number}> = ({expr, open}) => {
  const p = {stroke: C.ink, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const y = -203;
  if (expr === 'shout' || expr === 'scared' || open > 0.05) {
    const base = expr === 'shout' ? 16 : expr === 'scared' ? 7 : 2;
    const ry = base + open * 9;
    const rx = expr === 'shout' ? 18 : 9 + open * 3;
    return <ellipse cx={0} cy={y + 2} rx={rx} ry={ry} fill={C.ink} {...p} />;
  }
  switch (expr) {
    case 'worried':
      return <path d={`M -13 ${y} q 4 -5 8 0 q 4 5 8 0 q 3 -4 6 0`} fill="none" {...p} />;
    case 'sad':
      return <path d={`M -12 ${y + 4} Q 0 ${y - 7} 12 ${y + 4}`} fill="none" {...p} />;
    case 'stern':
      return <path d={`M -13 ${y} L 13 ${y}`} {...p} />;
    case 'smirk':
      return <path d={`M -12 ${y + 1} Q 2 ${y + 4} 13 ${y - 6}`} fill="none" {...p} />;
    case 'blank':
      return <path d={`M -6 ${y} L 6 ${y}`} {...p} />;
    default:
      return <path d={`M -10 ${y} Q 0 ${y + 4} 10 ${y}`} fill="none" {...p} />;
  }
};

const HatShape: React.FC<{hat: Hat}> = ({hat}) => {
  const s = {stroke: C.ink, strokeWidth: STROKE, strokeLinejoin: 'round' as const};
  switch (hat) {
    case 'sailor':
      return (
        <g>
          <path d="M -44 -284 Q -46 -322 0 -326 Q 46 -322 44 -284 Z" fill={C.white} {...s} />
          <path d="M -58 -282 Q 0 -300 58 -282 Q 60 -270 50 -266 Q 0 -280 -50 -266 Q -60 -270 -58 -282 Z" fill={C.white} {...s} />
        </g>
      );
    case 'officer':
    case 'officerHeadset':
      return (
        <g>
          <path d="M -60 -282 Q -70 -318 0 -322 Q 70 -318 60 -282 Z" fill={C.khaki} {...s} />
          <rect x={-56} y={-288} width={112} height={14} rx={4} fill={C.khakiDark} {...s} />
          <path d="M -46 -274 Q 0 -262 52 -276 Q 40 -258 -40 -262 Z" fill={C.ink} {...s} />
          <circle cx={0} cy={-300} r={7} fill={C.mustard} stroke={C.ink} strokeWidth={3} />
          {hat === 'officerHeadset' ? <Headset /> : null}
        </g>
      );
    case 'helmet':
      return (
        <g>
          <path d="M -70 -246 Q -74 -320 0 -324 Q 74 -320 70 -246 Q 0 -262 -70 -246 Z" fill={C.olive} {...s} />
          <path d="M -80 -244 Q 0 -266 80 -244" fill="none" {...s} />
        </g>
      );
    case 'pilot':
      return (
        <g>
          <path d="M -68 -232 Q -74 -318 0 -322 Q 74 -318 68 -232 Q 56 -262 0 -266 Q -56 -262 -68 -232 Z" fill={C.white} {...s} />
          <rect x={-40} y={-298} width={80} height={22} rx={10} fill={C.steelDark} {...s} />
        </g>
      );
    case 'headset':
      return <Headset />;
    default:
      return null;
  }
};

const Headset: React.FC = () => (
  <g>
    <path d="M -64 -238 Q -70 -316 0 -318 Q 70 -316 64 -238" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    <rect x={-80} y={-262} width={22} height={40} rx={8} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
    <rect x={58} y={-262} width={22} height={40} rx={8} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
    <path d="M 70 -224 Q 66 -196 30 -196" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <circle cx={28} cy={-196} r={6} fill={C.ink} />
  </g>
);

const Hair: React.FC<{hair: 'none' | 'old' | 'short'}> = ({hair}) => {
  if (hair === 'old') {
    return (
      <g fill="#d9d9d9" stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
        <path d="M -60 -262 Q -76 -244 -66 -214 Q -58 -232 -54 -252 Z" />
        <path d="M 60 -262 Q 76 -244 66 -214 Q 58 -232 54 -252 Z" />
        <path d="M -30 -290 Q 0 -302 34 -290" fill="none" stroke="#b9b9b9" strokeWidth={5} />
        <path d="M -24 -280 Q 4 -290 30 -280" fill="none" stroke="#c9c9c9" strokeWidth={4} />
      </g>
    );
  }
  if (hair === 'short') {
    return <path d="M -60 -258 Q -62 -300 0 -300 Q 62 -300 60 -258 Q 40 -284 0 -284 Q -40 -284 -60 -258 Z" fill={C.ink} />;
  }
  return null;
};

const Torso: React.FC<{outfit: Outfit; breathe: number}> = ({outfit, breathe}) => {
  const fill = OUTFIT_FILL[outfit];
  const s = {stroke: C.ink, strokeWidth: STROKE, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(0 -30) scale(1 ${breathe}) translate(0 30)`}>
      <path
        d="M -52 -162 C -68 -120 -72 -62 -60 -36 C -50 -18 50 -18 60 -36 C 72 -62 68 -120 52 -162 C 36 -182 -36 -182 -52 -162 Z"
        fill={fill}
        {...s}
      />
      {outfit === 'sailor' ? (
        <g>
          <rect x={14} y={-138} width={26} height={22} rx={3} fill="none" stroke={C.ink} strokeWidth={4} />
          <path d="M 0 -170 L 0 -40" stroke={C.ink} strokeWidth={3} opacity={0.6} />
        </g>
      ) : null}
      {outfit === 'officer' ? (
        <g>
          <path d="M -26 -172 L 0 -140 L 26 -172" fill="none" stroke={C.ink} strokeWidth={4} />
          <rect x={-58} y={-164} width={22} height={9} rx={2} fill={C.ink} transform="rotate(-18 -47 -160)" />
          <rect x={36} y={-164} width={22} height={9} rx={2} fill={C.ink} transform="rotate(18 47 -160)" />
        </g>
      ) : null}
      {outfit === 'suit' ? (
        <g>
          <path d="M -24 -174 L 0 -118 L 24 -174 Z" fill="#cfe0ef" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -6 -168 L 6 -168 L 9 -128 L 0 -116 L -9 -128 Z" fill="#273a63" stroke={C.ink} strokeWidth={3} />
          <path d="M -24 -174 L -6 -110 M 24 -174 L 6 -110" stroke={C.ink} strokeWidth={4} fill="none" />
          <circle cx={0} cy={-80} r={4} fill={C.ink} />
          <circle cx={0} cy={-58} r={4} fill={C.ink} />
        </g>
      ) : null}
      {outfit === 'pilot' ? (
        <g stroke={C.ink} strokeWidth={4} fill="none">
          <path d="M -40 -168 L 20 -40 M 40 -168 L -20 -40" />
          <rect x={-18} y={-110} width={36} height={18} rx={4} fill={C.steel} />
        </g>
      ) : null}
    </g>
  );
};

export const Character: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  flip = false,
  outfit = 'sailor',
  hat = 'none',
  hair = 'none',
  glasses = false,
  expr = 'neutral',
  talk = false,
  sweat = false,
  tremble = 0,
  armL = {a: 10, bend: 0.2},
  armR = {a: 10, bend: 0.2},
  look = [0, 0],
  headTilt = 0,
  lean = 0,
  seed = 1,
  handR,
  handL,
  headOnly = false,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const breathe = 1 + 0.012 * Math.sin(2 * Math.PI * 0.27 * t + seed);
  const bob = 1.5 * Math.sin(2 * Math.PI * 0.27 * t + seed);
  const shakeX = tremble * 4 * noise2D(`tx${seed}`, t * 9, 0);
  const shakeY = tremble * 3 * noise2D(`ty${seed}`, t * 9, 0);

  // Chớp mắt: lịch riêng cho từng nhân vật, mỗi lần 3 frame.
  const period = 80 + Math.floor(random(`blink${seed}`) * 70);
  const phase = (frame + Math.floor(random(`bph${seed}`) * period)) % period;
  const blink = phase < 3 ? [0.15, 0.05, 0.4][phase] : 1;

  // Nhép miệng khi nói: hai sóng lệch nhau để không đều như máy.
  const open = talk ? Math.max(0, 0.55 + 0.45 * Math.sin(t * 17 + seed) * Math.sin(t * 6.3 + seed * 2)) : 0;

  const eyeScale = expr === 'scared' || expr === 'shout' ? 1.25 : 1;
  const lx = look[0] * 7;
  const ly = look[1] * 5;
  const left = armPath(-1, armL);
  const right = armPath(1, armR);
  const armStyle = {stroke: C.ink, strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none'};

  const sweatDrop = (i: number) => {
    const p = ((frame + i * 23 + seed * 11) % 46) / 46;
    return (
      <path
        key={i}
        d="M 0 -12 Q 9 2 0 9 Q -9 2 0 -12 Z"
        transform={`translate(${66 + i * 12} ${-268 + p * 34 + i * 18}) scale(${1 - p * 0.3})`}
        fill="#cfeaff"
        stroke={C.ink}
        strokeWidth={3}
        opacity={1 - p}
      />
    );
  };

  return (
    <g transform={`translate(${x + shakeX} ${y + shakeY}) scale(${flip ? -scale : scale} ${scale}) rotate(${lean})`}>
      {!headOnly ? (
        <g>
          <path d="M -20 -34 L -24 -4" {...armStyle} strokeWidth={8} />
          <path d="M 20 -34 L 24 -4" {...armStyle} strokeWidth={8} />
          <ellipse cx={-28} cy={-2} rx={14} ry={6} fill={C.ink} />
          <ellipse cx={28} cy={-2} rx={14} ry={6} fill={C.ink} />
          <Torso outfit={outfit} breathe={breathe} />
          <path d={left.d} {...armStyle} />
          <path d={right.d} {...armStyle} />
          <g transform={`translate(${left.hx} ${left.hy})`}>
            {handL}
            <circle r={12} fill={C.skin} stroke={C.ink} strokeWidth={5} />
          </g>
          <g transform={`translate(${right.hx} ${right.hy})`}>
            {handR}
            <circle r={12} fill={C.skin} stroke={C.ink} strokeWidth={5} />
          </g>
        </g>
      ) : null}
      <g transform={`translate(0 ${bob}) rotate(${headTilt} 0 ${HEAD_Y})`}>
        <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={C.skin} stroke={C.ink} strokeWidth={STROKE} />
        <Hair hair={hair} />
        {[-22, 22].map((ex) => (
          <g key={ex} transform={`translate(${ex + lx} ${-236 + ly}) scale(${eyeScale} ${eyeScale * blink})`}>
            <ellipse rx={8} ry={10} fill={C.ink} />
            <circle cx={2.5} cy={-3.5} r={2.6} fill={C.white} />
          </g>
        ))}
        {glasses ? (
          <g fill="none" stroke={C.ink} strokeWidth={3.5}>
            <rect x={-42} y={-252} width={34} height={28} rx={9} />
            <rect x={8} y={-252} width={34} height={28} rx={9} />
            <path d="M -8 -240 Q 0 -246 8 -240 M -42 -240 L -62 -244 M 42 -240 L 62 -244" />
          </g>
        ) : null}
        <Brows expr={expr} />
        <Mouth expr={expr} open={open} />
        <HatShape hat={hat} />
        {sweat ? [0, 1].map(sweatDrop) : null}
      </g>
    </g>
  );
};
