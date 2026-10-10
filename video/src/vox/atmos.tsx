import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../lib/fonts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Mặt bảng điều tra: vân nền + rất nhiều giấy tờ mờ phía sau (để không có khoảng trống),
 * vết cốc cà phê, đinh ghim cũ, nét chì nguệch ngoạc.
 */
export const Board: React.FC<{width: number; height: number; clutter?: number}> = ({width, height, clutter = 60}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width, height}}>
    <Img src={staticFile('vox/board.jpg')} style={{position: 'absolute', left: 0, top: 0, width, height}} />
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {new Array(clutter).fill(0).map((_, i) => {
        const x = random(`bx${i}`) * width;
        const y = random(`by${i}`) * height;
        const w = 260 + random(`bw${i}`) * 520;
        const h = 200 + random(`bh${i}`) * 420;
        const rot = (random(`br${i}`) - 0.5) * 30;
        const tone = ['#d9d2c2', '#cfc6b2', '#e6e0d1', '#bfb39b', '#d8cfa6'][i % 5];
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.16 + random(`bo${i}`) * 0.14}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={tone} />
            {new Array(Math.floor(h / 34)).fill(0).map((__, k) => (
              <rect key={k} x={-w / 2 + 26} y={-h / 2 + 30 + k * 30} width={(w - 52) * (0.5 + 0.5 * random(`bl${i}-${k}`))} height={8} fill="#3a352e" opacity={0.5} />
            ))}
          </g>
        );
      })}
      {new Array(5).fill(0).map((_, i) => (
        <circle key={`c${i}`} cx={random(`cx${i}`) * width} cy={random(`cy${i}`) * height} r={70 + random(`cr${i}`) * 40} fill="none" stroke="#5a3b1f" strokeWidth={10} opacity={0.18} />
      ))}
      {new Array(30).fill(0).map((_, i) => (
        <circle key={`p${i}`} cx={random(`px${i}`) * width} cy={random(`py${i}`) * height} r={9} fill={['#c0261b', '#2b4c9a', '#d9a521'][i % 3]} opacity={0.35} />
      ))}
      {new Array(14).fill(0).map((_, i) => {
        const x = random(`sx${i}`) * width;
        const y = random(`sy${i}`) * height;
        let d = `M ${x} ${y}`;
        for (let k = 1; k < 8; k++) {
          d += ` q ${30 + random(`sq${i}${k}`) * 40} ${(random(`sw${i}${k}`) - 0.5) * 80} ${60 + random(`ss${i}${k}`) * 40} 0`;
        }
        return <path key={`s${i}`} d={d} fill="none" stroke="#e9e2d0" strokeWidth={4} opacity={0.08} />;
      })}
    </svg>
  </div>
);

/** Bụi lơ lửng trong ánh đèn (lớp màn hình). */
export const Dust: React.FC<{count?: number; opacity?: number}> = ({count = 46, opacity = 0.5}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const x = (random(`dx${i}`) * width + frame * (0.3 + random(`dv${i}`) * 0.8)) % width;
        const y = (random(`dy${i}`) * height + Math.sin(frame / 40 + i) * 30 - frame * 0.25 * random(`du${i}`) + height) % height;
        const r = 1.2 + random(`dr${i}`) * 3.2;
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff6dc" opacity={0.25 + 0.5 * Math.abs(Math.sin(frame / 25 + i))} />;
      })}
    </svg>
  );
};

/** Vệt sáng ấm trôi chậm ở mép khung, như ánh đèn bàn hắt vào. */
export const LightLeak: React.FC<{opacity?: number}> = ({opacity = 0.22}) => {
  const frame = useCurrentFrame();
  const x = 15 + 20 * Math.sin(frame / 90);
  const y = 10 + 15 * Math.cos(frame / 110);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity,
        background: `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,170,80,0.85) 0%, rgba(255,120,40,0.25) 25%, rgba(0,0,0,0) 55%)`,
      }}
    />
  );
};

/** Đèn bàn bật lên: tối hoàn toàn, rồi một vùng sáng bừng lên ở giữa, tối dần ra mép. */
export const Spotlight: React.FC<{on: number; strength?: number}> = ({on, strength = 0.7}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [on, on + 3, on + 5, on + 9], [0, 0.8, 0.55, 1], clamp);
  const dark = 1 - k * (1 - strength * 0.55);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,${(1 - k) * 0.98}) 0%, rgba(0,0,0,${Math.min(1, dark * 0.85)}) 75%, rgba(0,0,0,${Math.min(1, 0.6 + dark * 0.4)}) 100%)`,
      }}
    />
  );
};

/** Dòng ghi nguồn ở chân khung, kiểu Vox. */
export const SourceTag: React.FC<{text: string; at: number; out?: number}> = ({text, at, out}) => {
  const frame = useCurrentFrame();
  if (frame < at || (out !== undefined && frame > out + 8)) {
    return null;
  }
  const p = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const o = out !== undefined ? interpolate(frame, [out, out + 8], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        bottom: 205,
        maxWidth: 1100,
        padding: '8px 16px',
        background: 'rgba(16,14,12,0.78)',
        color: '#efe8d8',
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 0.5,
        opacity: p * o,
        transform: `translateX(${(1 - p) * -30}px)`,
        borderLeft: '6px solid #f2c230',
      }}
    >
      {text}
    </div>
  );
};
