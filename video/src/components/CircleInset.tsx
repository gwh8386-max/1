import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../lib/theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Ô tròn chèn cảnh: một cửa sổ tròn bật lên cạnh nhân vật, bên trong là một cảnh khác
 * (đang chạy bình thường). Có thể nở ra thành toàn khung để trở thành cảnh chính.
 *
 *  children   nội dung khổ 1920x1080 (bối cảnh, nhân vật... như một cảnh bình thường)
 *  x, y, r    tâm và bán kính ô trên màn hình
 *  fx, fy     điểm của nội dung sẽ nằm giữa ô; zoom = tỉ lệ nội dung trong ô
 *  tail       điểm (thường là đầu nhân vật) để vẽ chuỗi bong bóng nối tới ô
 *  expandAt   frame bắt đầu nở ra toàn khung
 */
export const CircleInset: React.FC<{
  children: React.ReactNode;
  at: number;
  out?: number;
  x: number;
  y: number;
  r: number;
  fx?: number;
  fy?: number;
  zoom?: number;
  tail?: [number, number];
  expandAt?: number;
  expandDur?: number;
}> = ({children, at, out, x, y, r, fx = 960, fy = 540, zoom = 0.5, tail, expandAt, expandDur = 16}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  if (frame < at || (out !== undefined && frame > out + 10)) {
    return null;
  }
  const pop = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 170, mass: 0.6}});
  const close = out !== undefined ? interpolate(frame, [out, out + 9], [1, 0], {...clamp, easing: Easing.in(Easing.back(1.6))}) : 1;
  const e = expandAt !== undefined ? interpolate(frame, [expandAt, expandAt + expandDur], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}) : 0;

  const full = Math.hypot(width, height) / 2 + 40;
  const cx = x + (width / 2 - x) * e;
  const cy = y + (height / 2 - y) * e;
  const R = Math.max(0, (r + (full - r) * e) * pop * close);
  const z = zoom + (1 - zoom) * e;
  const fxx = fx + (width / 2 - fx) * e;
  const fyy = fy + (height / 2 - fy) * e;
  const ring = 1 - e;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {ring > 0 ? (
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          {tail
            ? [0.18, 0.32].map((k, i) => {
                const bx = tail[0] + (x - tail[0]) * k;
                const by = tail[1] + (y - tail[1]) * k;
                const s = interpolate(frame - at, [i * 3, i * 3 + 6], [0, 1], clamp) * close;
                return <circle key={i} cx={bx} cy={by} r={(10 + i * 7) * s} fill={C.white} stroke={C.ink} strokeWidth={5} opacity={ring} />;
              })
            : null}
          <circle cx={cx + 9} cy={cy + 12} r={R} fill={C.ink} opacity={ring} />
        </svg>
      ) : null}
      <AbsoluteFill style={{clipPath: `circle(${R}px at ${cx}px ${cy}px)`}}>
        <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${cx - fxx * z}px, ${cy - fyy * z}px) scale(${z})`}}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      {ring > 0 ? (
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.white} strokeWidth={10} opacity={ring} />
          <circle cx={cx} cy={cy} r={R + 6} fill="none" stroke={C.ink} strokeWidth={8} opacity={ring} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
