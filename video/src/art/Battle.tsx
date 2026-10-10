import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Rain} from '../components/Overlays';
import {Destroyer, NightSea, Tracer} from './Sea';

/** Cảnh hai tàu bắn vào bóng tối; tách riêng để cảnh 5 dừng hình được. */
export const Firing: React.FC<{shots: number[]}> = ({shots}) => {
  const frame = useCurrentFrame();
  const flashLevel = shots.reduce((m, s) => {
    const k = (frame - s) / 8;
    return k >= 0 && k <= 1 ? Math.max(m, 1 - k) : m;
  }, 0);
  return (
    <AbsoluteFill>
      <NightSea horizon={600} flash={flashLevel}>
        <Destroyer x={1180} y={620} s={0.5} flashes={shots.filter((_, i) => i % 3 === 2)} />
        <Destroyer x={640} y={760} s={0.95} flashes={shots.filter((_, i) => i % 3 !== 2)} />
        {shots.map((s, i) => (
          <Tracer key={i} x0={i % 3 === 2 ? 1350 : 960} y0={i % 3 === 2 ? 570 : 650} x1={1950 + random(`tx${i}`) * 200} y1={420 + random(`ty${i}`) * 160} at={s + 1} />
        ))}
      </NightSea>
      <Rain count={160} opacity={0.45} />
    </AbsoluteFill>
  );
};

export const firingShots = (total: number) => {
  const out: number[] = [];
  let f = 6;
  let i = 0;
  while (f < total + 40) {
    out.push(Math.round(f));
    f += 9 + random(`shot${i++}`) * 14;
  }
  return out;
};

