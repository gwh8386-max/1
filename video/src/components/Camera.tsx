import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';

export type Shake = {at: number; amp?: number; dur?: number};
export type Snap = {at: number; to: number; x?: number; y?: number; back?: number};

/**
 * Máy quay ảo bọc cả cảnh:
 *  - push: đẩy chậm từ zoom[0] tới zoom[1] suốt cảnh, quanh điểm (x, y) tính theo %.
 *  - drift: trôi ngang nhẹ (px).
 *  - shakes: rung khi nổ, giảm dần.
 *  - snaps: zoom giật vào một điểm (lò xo), có thể nhả ra ở frame `back`.
 *  - handheld: rung tay nhẹ liên tục.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  zoom?: [number, number];
  x?: number;
  y?: number;
  drift?: number;
  shakes?: Shake[];
  snaps?: Snap[];
  handheld?: number;
  duration?: number;
}> = ({children, zoom = [1, 1.06], x = 50, y = 50, drift = 0, shakes = [], snaps = [], handheld = 0.6, duration}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const total = duration ?? durationInFrames;
  const p = interpolate(frame, [0, total], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  let scale = zoom[0] + (zoom[1] - zoom[0]) * p;
  let ox = x;
  let oy = y;
  for (const sn of snaps) {
    if (frame < sn.at) {
      continue;
    }
    const s = spring({frame: frame - sn.at, fps, config: {damping: 15, stiffness: 160}});
    const r = sn.back !== undefined && frame >= sn.back ? spring({frame: frame - sn.back, fps, config: {damping: 18, stiffness: 90}}) : 0;
    const k = s * (1 - r);
    scale *= 1 + (sn.to - 1) * k;
    ox = ox + ((sn.x ?? x) - ox) * k;
    oy = oy + ((sn.y ?? y) - oy) * k;
  }
  const t = frame / fps;
  let sx = handheld * 6 * noise2D('hx', t * 0.6, 0);
  let sy = handheld * 5 * noise2D('hy', t * 0.6, 0);
  let rot = handheld * 0.25 * noise2D('hr', t * 0.5, 0);
  for (const sh of shakes) {
    const d = sh.dur ?? 14;
    if (frame >= sh.at && frame < sh.at + d) {
      const k = (1 - (frame - sh.at) / d) ** 2 * (sh.amp ?? 24);
      sx += k * noise2D('sx', frame * 0.9, sh.at);
      sy += k * noise2D('sy', frame * 0.9, sh.at);
      rot += k * 0.04 * noise2D('sr', frame * 0.9, sh.at);
    }
  }
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${ox}% ${oy}%`,
        transform: `translate(${sx - drift * p}px, ${sy}px) rotate(${rot}deg) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
