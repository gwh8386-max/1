import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';
import {outline} from './Text';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Hai nét gạch vẽ tay (toạ độ % của khung chữ), nét sau chéo ngược nét trước.
const STROKES = ['M 2 62 C 28 50, 62 66, 98 42', 'M 3 38 C 34 58, 66 36, 97 64'];

/**
 * Gạch xoá kỳ vọng: chữ hiện lên, bị gạch bằng nét bút đỏ vẽ tay, rồi chữ đúng bật ra bên dưới.
 *  paper: chữ máy đánh trên mảnh giấy (dùng khi nhắc lại một văn bản đã thấy)
 */
export const StrikeText: React.FC<{
  text: string;
  at: number;
  strikeAt: number;
  out?: number;
  x: number;
  y: number;
  size?: number;
  color?: string;
  paper?: boolean;
  rotate?: number;
  replace?: string;
  replaceAt?: number;
  replaceColor?: string;
}> = ({text, at, strikeAt, out, x, y, size = 120, color = C.white, paper = false, rotate = -2, replace, replaceAt, replaceColor = C.mustard}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || (out !== undefined && frame > out + 10)) {
    return null;
  }
  const pop = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 190, mass: 0.6}});
  const exit = out !== undefined ? interpolate(frame, [out, out + 8], [1, 0], clamp) : 1;
  const struck = frame >= strikeAt;
  const rep = replaceAt !== undefined && frame >= replaceAt ? spring({frame: frame - replaceAt, fps, config: {damping: 11, stiffness: 180, mass: 0.7}}) : 0;
  const strokeW = Math.max(8, size * 0.1);

  const word = paper ? (
    <div
      style={{
        fontFamily: FONT.mono,
        fontWeight: 700,
        fontSize: size * 0.62,
        color: C.ink,
        background: '#fbf7ea',
        border: `6px solid ${C.ink}`,
        boxShadow: `10px 12px 0 ${C.ink}`,
        padding: `${size * 0.12}px ${size * 0.3}px`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : (
    <div style={{fontFamily: FONT.display, fontSize: size, color, textShadow: outline(Math.max(6, size * 0.06)), lineHeight: 1.05, whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${(1.4 - 0.4 * pop) * (0.9 + 0.1 * exit)})`,
        opacity: Math.min(1, pop * 2) * exit,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{position: 'relative', opacity: struck ? 0.8 : 1}}>
        {word}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: '-6%', top: '-8%', width: '112%', height: '116%', overflow: 'visible'}}>
          {STROKES.map((d, i) => {
            const p = interpolate(frame, [strikeAt + i * 4, strikeAt + i * 4 + 6], [0, 1], clamp);
            return p > 0 ? (
              <path
                key={i}
                d={d}
                pathLength={100}
                strokeDasharray="100 100"
                strokeDashoffset={100 - p * 100}
                fill="none"
                stroke={C.blood}
                strokeWidth={strokeW}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null;
          })}
        </svg>
      </div>
      {replace && rep > 0 ? (
        <div
          style={{
            marginTop: size * 0.18,
            fontFamily: FONT.display,
            fontSize: size * 1.05,
            color: replaceColor,
            textShadow: outline(Math.max(7, size * 0.07)),
            transform: `rotate(${3 - rotate}deg) scale(${interpolate(rep, [0, 1], [2, 1])})`,
            opacity: Math.min(1, rep * 3),
            whiteSpace: 'nowrap',
          }}
        >
          {replace}
        </div>
      ) : null}
    </div>
  );
};
