import React from 'react';
import {AbsoluteFill, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {Sfx} from '../../components/Sfx';
import {C} from '../../lib/theme';
import {Cutout, Enter, Fit169} from '../../vox/paper';

/** Chỉ vẽ con trong khoảng frame [from, to) (mỗi bảng điều tra chỉ sống trong chương của nó). */
export const Only: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? <>{children}</> : null;
};

/** Mảnh giấy chứa một cảnh hoạt hình 1920x1080; có thể đóng băng và bạc màu từ `freezeAt`. */
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  at?: number;
  enter?: Enter;
  freezeAt?: number;
  seed: string;
  pin?: boolean;
  tape?: boolean;
  children: React.ReactNode;
}> = ({x, y, w, h, rot = 0, at, enter = 'drop', freezeAt, seed, pin = true, tape, children}) => {
  const frame = useCurrentFrame();
  const g = freezeAt !== undefined ? interpolate(frame, [freezeAt, freezeAt + 8], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <Cutout x={x} y={y} w={w} h={h} rot={rot} at={at} enter={enter} seed={seed} pin={pin} tape={tape} style={g > 0 ? {filter: `grayscale(${g}) brightness(${1 - 0.15 * g})`} : undefined}>
      <Freeze frame={freezeAt ?? 0} active={freezeAt !== undefined && frame >= freezeAt}>
        <Fit169 w={w} h={h}>
          {children}
        </Fit169>
      </Freeze>
    </Cutout>
  );
};

/** Lá cờ Phần Lan nhỏ cắm trên ghim. */
export const FinFlag: React.FC<{x: number; y: number; s?: number; at?: number}> = ({x, y, s = 1, at}) => {
  const frame = useCurrentFrame();
  if (at !== undefined && frame < at) {
    return null;
  }
  const k = at === undefined ? 1 : interpolate(frame, [at, at + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
  <svg width={160 * s} height={200 * s} viewBox="0 0 160 200" style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `scaleY(${k})`, transformOrigin: '0 100%'}}>
    <line x1={10} y1={0} x2={10} y2={200} stroke={C.ink} strokeWidth={8} />
    <rect x={14} y={6} width={140} height={90} fill="#ffffff" stroke={C.ink} strokeWidth={5} />
    <rect x={54} y={6} width={22} height={90} fill="#1f4fa0" />
    <rect x={14} y={40} width={140} height={22} fill="#1f4fa0" />
  </svg>
  );
};

/** Chân dung cận mặt trong mũ trùm tuyết (ảnh polaroid). */
export const HoodPortrait: React.FC<{expr?: 'neutral' | 'focused' | 'smirk'; old?: boolean; outfit?: 'snow' | 'officer' | 'shirt'; hat?: 'hood' | 'kepi' | 'cap'}> = ({
  expr = 'neutral',
  old,
  outfit = 'snow',
  hat = 'hood',
}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#c9d3dc, #eef2f5)'}}>
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <Character x={960} y={1700} scale={5.2} outfit={outfit} hat={hat} hair={old ? 'old' : 'none'} expr={expr} seed={7} />
    </svg>
  </AbsoluteFill>
);

// Video này dày hiệu ứng: hạ chung cả lớp SFX để nền thấp hơn giọng đọc.
const SFX_LEVEL = 0.6;
export const S: React.FC<React.ComponentProps<typeof Sfx>> = (p) => <Sfx {...p} volume={(p.volume ?? 0.8) * SFX_LEVEL} />;
