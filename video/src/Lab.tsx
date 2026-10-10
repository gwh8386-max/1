import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Character} from './components/Character';
import {DateStamp, NameTag, PunchText} from './components/Text';
import {Radar} from './art/Radar';
import {Grain} from './components/Overlays';

/** Trang thử nghiệm: xem nhanh nhân vật và các thành phần. */
export const Lab: React.FC = () => (
  <AbsoluteFill style={{background: '#e9e3d6'}}>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(0.42)', transformOrigin: '0 0'}}>
      <Radar blips={[{theta: 40, r0: 380, r1: 300}, {theta: 60, r0: 330, r1: 260}, {theta: 75, r0: 400, r1: 340}]} />
    </div>
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <Character x={1000} y={520} outfit="sailor" hat="sailor" expr="worried" sweat seed={1} armL={{a: 30}} armR={{a: 120, bend: -0.4}} />
      <Character x={1250} y={520} outfit="officer" hat="officer" expr="stern" seed={2} armR={{a: 60}} />
      <Character x={1500} y={520} outfit="suit" hair="old" glasses expr="sad" seed={3} talk />
      <Character x={1750} y={520} outfit="pilot" hat="pilot" expr="scared" seed={4} armL={{a: 160}} armR={{a: 160}} />
      <Character x={300} y={1020} outfit="sailor" hat="headset" expr="shout" seed={5} scale={0.9} />
      <Character x={600} y={1020} outfit="shirt" hair="short" expr="smirk" seed={6} />
      <Character x={900} y={1020} outfit="sailor" hat="helmet" expr="focused" seed={7} />
      <Character x={1200} y={1020} outfit="officer" hat="officerHeadset" expr="blank" seed={8} />
    </svg>
    <PunchText text="NGƯ LÔI!" at={0} x={1500} y={760} size={150} color="#f0b72f" />
    <NameTag name="ROBERT McNAMARA" sub="Bộ trưởng Quốc phòng Mỹ" at={-30} x={60} y={600} />
    <DateStamp text="4/8/1964 · VỊNH BẮC BỘ" at={-60} corner="bl" />
    <Grain />
  </AbsoluteFill>
);
