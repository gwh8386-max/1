import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {Glow, H, Rivets, W} from './common';

export type Blip = {theta: number; r0: number; r1: number; from?: number; to?: number; size?: number};

const CX = W / 2;
const CY = H / 2;
const R = 430;

/** Các frame mà vạch quét đi qua góc theta (dùng để đặt tiếng bíp). */
export const sweepHits = (theta: number, periodSec: number, fps: number, from: number, to: number) => {
  const out: number[] = [];
  const p = periodSec * fps;
  for (let f = (theta / 360) * p; f < to; f += p) {
    if (f >= from) {
      out.push(Math.round(f));
    }
  }
  return out;
};

/**
 * Màn radar: vạch quét có vệt lưu ảnh, đốm sáng bừng lên khi vạch quét đi qua rồi mờ dần.
 *  morphAt: frame các đốm hoá thành bóng tàu địch (màu đỏ)
 *  fadeAt: frame từng đốm tắt hẳn (theo thứ tự)
 *  noise: mật độ đốm nhiễu (0..1)
 */
export const Radar: React.FC<{
  blips: Blip[];
  period?: number;
  noise?: number;
  morphAt?: number;
  fadeAt?: number[];
  dim?: number;
}> = ({blips, period = 2.4, noise = 0, morphAt, fadeAt = [], dim = 1}) => {
  const frame = useCurrentFrame();
  const sweep = ((frame / (period * 30)) * 360) % 360;
  const toXY = (theta: number, r: number) => {
    const a = ((theta - 90) * Math.PI) / 180;
    return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
  };
  const wedges = new Array(28).fill(0).map((_, i) => {
    const a0 = sweep - i * 2.2;
    const a1 = a0 - 2.4;
    const [x0, y0] = toXY(a0, R);
    const [x1, y1] = toXY(a1, R);
    return <path key={i} d={`M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 0 0 ${x1} ${y1} Z`} fill={C.radar} opacity={0.22 * (1 - i / 28) ** 2 * dim} />;
  });
  const glowFor = (theta: number) => {
    const since = (((sweep - theta) % 360) + 360) % 360;
    return Math.exp(-since / 140);
  };
  const morph = morphAt !== undefined ? interpolate(frame, [morphAt, morphAt + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="scr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0b2a17" />
          <stop offset="100%" stopColor={C.radarBg} />
        </radialGradient>
        <radialGradient id="glass" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
          <stop offset="60%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <Glow id="blipGlow" sd={7} />
        <clipPath id="scrClip">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>
      {/* Vỏ máy */}
      <rect x={0} y={0} width={W} height={H} fill={C.steelDark} />
      <rect x={300} y={40} width={W - 600} height={H - 80} rx={40} fill={C.steel} stroke={C.ink} strokeWidth={8} />
      <Rivets x={300} y={40} w={W - 600} h={H - 80} gap={90} />
      <circle cx={CX} cy={CY} r={R + 40} fill={C.steelDark} stroke={C.ink} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={R} fill="url(#scr)" stroke={C.ink} strokeWidth={6} />
      <g clipPath="url(#scrClip)">
        {[0.25, 0.5, 0.75].map((k) => (
          <circle key={k} cx={CX} cy={CY} r={R * k} fill="none" stroke={C.radarDim} strokeWidth={2.5} opacity={dim} />
        ))}
        <path d={`M ${CX - R} ${CY} L ${CX + R} ${CY} M ${CX} ${CY - R} L ${CX} ${CY + R}`} stroke={C.radarDim} strokeWidth={2} opacity={dim} />
        {wedges}
        {(() => {
          const [x, y] = toXY(sweep, R);
          return <line x1={CX} y1={CY} x2={x} y2={y} stroke={C.radar} strokeWidth={4} opacity={0.9 * dim} />;
        })()}
        {/* Đốm nhiễu */}
        {noise > 0
          ? new Array(Math.round(120 * noise)).fill(0).map((_, i) => {
              const seed = `${i}-${Math.floor(frame / 3)}`;
              const th = random(`nt${seed}`) * 360;
              const rr = Math.sqrt(random(`nr${seed}`)) * R;
              const [x, y] = toXY(th, rr);
              return <circle key={i} cx={x} cy={y} r={2 + random(`ns${seed}`) * 3} fill={C.radar} opacity={0.15 + 0.5 * random(`no${seed}`)} />;
            })
          : null}
        {/* Đốm mục tiêu */}
        <g filter="url(#blipGlow)">
          {blips.map((b, i) => {
            if (b.from !== undefined && frame < b.from) {
              return null;
            }
            const fadeK = fadeAt[i] !== undefined ? interpolate(frame, [fadeAt[i], fadeAt[i] + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
            const p = interpolate(frame, [b.from ?? 0, b.to ?? 300], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const r = b.r0 + (b.r1 - b.r0) * p;
            const [x, y] = toXY(b.theta, r);
            const g = glowFor(b.theta);
            const s = b.size ?? 1;
            return (
              <g key={i} opacity={fadeK}>
                <circle cx={x} cy={y} r={(9 + 6 * g) * s * (1 - morph * 0.6)} fill={C.radar} opacity={(0.25 + 0.75 * g) * (1 - morph)} />
                {morph > 0 ? (
                  <g transform={`translate(${x} ${y}) scale(${morph * 1.3 * s}) rotate(${b.theta + 90})`} opacity={morph}>
                    <path d="M -34 6 L 30 6 L 40 -4 L -26 -4 Z M -6 -4 L -6 -16 L 10 -16 L 14 -4 Z" fill={C.blood} stroke="#ff9a9a" strokeWidth={3} strokeLinejoin="round" />
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
        {/* Vạch quét mờ + kính */}
        {new Array(40).fill(0).map((_, i) => (
          <rect key={i} x={CX - R} y={CY - R + i * (R / 20)} width={2 * R} height={2} fill="#000" opacity={0.18} />
        ))}
      </g>
      <circle cx={CX} cy={CY} r={R} fill="url(#glass)" />
      {/* Vạch chia độ */}
      {new Array(36).fill(0).map((_, i) => {
        const [x0, y0] = toXY(i * 10, R + 6);
        const [x1, y1] = toXY(i * 10, R + (i % 3 === 0 ? 30 : 18));
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#cfd6dc" strokeWidth={3} />;
      })}
      {/* Núm vặn */}
      {[
        [400, 900],
        [1520, 900],
        [400, 180],
        [1520, 180],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={44} fill={C.steelDark} stroke={C.ink} strokeWidth={6} />
          <line x1={x} y1={y} x2={x + 30 * Math.cos(i + frame / 200)} y2={y + 30 * Math.sin(i + frame / 200)} stroke="#e7e7e7" strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
};
