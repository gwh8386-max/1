import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';

/**
 * Máy quay đi trên một "thế giới" lớn (bảng điều tra) theo các điểm dừng.
 *  at   frame máy quay tới nơi
 *  dur  số frame di chuyển để tới (mặc định 14); 'whip' = lia gắt, 'smooth' = trôi êm
 * Giữa hai điểm, máy quay vẫn đẩy chậm (drift) để khung hình không bao giờ đứng im.
 */
export type CamKey = {at: number; x: number; y: number; z: number; rot?: number; dur?: number; ease?: 'smooth' | 'whip'};
export type WorldShake = {at: number; amp?: number; dur?: number};

const EASE = {
  smooth: Easing.inOut(Easing.cubic),
  whip: Easing.bezier(0.75, 0, 0.2, 1),
};

type Cam = {x: number; y: number; z: number; rot: number};

const hold = (k: CamKey, f: number, drift: number): Cam => ({
  x: k.x,
  y: k.y,
  z: k.z * (1 + drift * Math.min(4, Math.max(0, (f - k.at) / 30))),
  rot: k.rot ?? 0,
});

export const camAt = (keys: CamKey[], f: number, drift = 0.016): Cam => {
  if (f <= keys[0].at) {
    return hold(keys[0], keys[0].at, drift);
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const n = keys[i + 1];
    const start = n.at - (n.dur ?? 14);
    if (f < start) {
      return hold(k, f, drift);
    }
    if (f < n.at) {
      const from = hold(k, start, drift);
      const p = (EASE[n.ease ?? 'whip'])((f - start) / (n.at - start));
      return {
        x: from.x + (n.x - from.x) * p,
        y: from.y + (n.y - from.y) * p,
        z: from.z + (n.z - from.z) * p,
        rot: from.rot + ((n.rot ?? 0) - from.rot) * p,
      };
    }
  }
  return hold(keys[keys.length - 1], f, drift);
};

/** Chuyển toạ độ thế giới -> toạ độ màn hình ở frame f (để đặt lớp phủ bám theo vật). */
export const worldToScreen = (keys: CamKey[], f: number, wx: number, wy: number, w = 1920, h = 1080): [number, number] => {
  const c = camAt(keys, f);
  return [w / 2 + (wx - c.x) * c.z, h / 2 + (wy - c.y) * c.z];
};

export const WorldView: React.FC<{
  keys: CamKey[];
  width: number;
  height: number;
  shakes?: WorldShake[];
  handheld?: number;
  children: React.ReactNode;
}> = ({keys, width, height, shakes = [], handheld = 0.6, children}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const c = camAt(keys, frame);
  const p = camAt(keys, frame - 1);
  // Nhoè theo tốc độ máy quay trên màn hình: lia càng gắt càng nhoè.
  const speed = Math.hypot((c.x - p.x) * c.z, (c.y - p.y) * c.z) + Math.abs(c.z - p.z) * 1400;
  const blur = interpolate(speed, [30, 260], [0, 14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const t = frame / fps;
  let sx = handheld * 6 * noise2D('wx', t * 0.5, 0);
  let sy = handheld * 5 * noise2D('wy', t * 0.5, 0);
  let rot = handheld * 0.2 * noise2D('wr', t * 0.4, 0);
  for (const sh of shakes) {
    const d = sh.dur ?? 12;
    if (frame >= sh.at && frame < sh.at + d) {
      const k = (1 - (frame - sh.at) / d) ** 2 * (sh.amp ?? 20);
      sx += k * noise2D('ssx', frame * 0.9, sh.at);
      sy += k * noise2D('ssy', frame * 0.9, sh.at);
      rot += k * 0.04 * noise2D('ssr', frame * 0.9, sh.at);
    }
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#1b1815'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) rotate(${c.rot + rot}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            transformOrigin: '0 0',
            transform: `translate(${W / 2 - c.x * c.z}px, ${H / 2 - c.y * c.z}px) scale(${c.z})`,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
