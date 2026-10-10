import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Biểu đồ phiếu bầu dựng bằng đầu người hoạt hình: mỗi phiếu thuận là một cái đầu nhỏ,
 * mọc dần từ dưới lên trong [start, end]. Cột "chống" trống, số 0 bật ra ở zeroAt.
 */
export const HeadsVote: React.FC<{
  w: number;
  h: number;
  yes: number;
  no: number;
  start: number;
  end: number;
  zeroAt: number;
  title: string;
  note?: string;
  cols?: number;
}> = ({w, h, yes, no, start, end, zeroAt, title, note, cols = 16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.round(interpolate(frame, [start, end], [0, yes], {...clamp, easing: Easing.out(Easing.cubic)}));
  const rows = Math.ceil(yes / cols);
  const colW = w * 0.44;
  const cell = colW / cols;
  const barH = rows * cell;
  const baseY = h - 150;
  const top = baseY - barH;
  const zero = frame >= zeroAt ? spring({frame: frame - zeroAt, fps, config: {damping: 9, stiffness: 200, mass: 0.6}}) : 0;
  const heads: React.ReactNode[] = [];
  for (let i = 0; i < Math.min(n, yes); i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const cx = w * 0.05 + c * cell + cell / 2;
    const cy = baseY - r * cell - cell / 2;
    const age = n - i;
    const s = Math.min(1, age / 6);
    heads.push(
      <g key={i} transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * s})`}>
        <circle r={cell * 0.42} fill="#ffffff" stroke={C.ink} strokeWidth={2} />
        <circle cx={-cell * 0.13} cy={-cell * 0.04} r={cell * 0.07} fill={C.ink} />
        <circle cx={cell * 0.13} cy={-cell * 0.04} r={cell * 0.07} fill={C.ink} />
      </g>,
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: FONT.display, fontSize: 54, color: C.ink, letterSpacing: 2}}>{title}</div>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {/* cột chống: khung nét đứt, trống trơn */}
        <rect x={w * 0.53} y={top} width={colW} height={barH} fill="none" stroke="#9a9182" strokeWidth={4} strokeDasharray="14 10" />
        <line x1={w * 0.03} y1={baseY + 6} x2={w * 0.97} y2={baseY + 6} stroke={C.ink} strokeWidth={6} />
        {heads}
      </svg>
      <div style={{position: 'absolute', left: w * 0.05, width: colW, top: Math.max(110, top - 120), textAlign: 'center', fontFamily: FONT.display, fontSize: 110, color: '#2f6b46', lineHeight: 1}}>{n}</div>
      <div
        style={{
          position: 'absolute',
          left: w * 0.53,
          width: colW,
          top: top + barH / 2 - 120,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontSize: 240,
          color: C.blood,
          lineHeight: 1,
          transform: `scale(${zero})`,
          opacity: Math.min(1, zero * 2),
        }}
      >
        {no}
      </div>
      <div style={{position: 'absolute', left: w * 0.05, width: colW, top: baseY + 18, textAlign: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 40, color: '#2f6b46', letterSpacing: 3}}>YEA</div>
      <div style={{position: 'absolute', left: w * 0.53, width: colW, top: baseY + 18, textAlign: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 40, color: C.blood, letterSpacing: 3}}>NAY</div>
      {note ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontFamily: FONT.script, fontWeight: 700, fontSize: 46, color: '#4b463e'}}>{note}</div> : null}
    </div>
  );
};
