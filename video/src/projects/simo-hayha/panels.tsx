import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {H, W} from '../../art/common';
import {Pine, ProneSniper, Rifle, Sled, SNOW, SnowForest} from '../../art/Winter';
import {Character} from '../../components/Character';
import {C} from '../../lib/theme';

// Các khung hoạt hình 1920x1080 của video Simo Häyhä (nhúng vào mảnh giấy bằng Fit169).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);

/** Loé đầu nòng ở xa, sau một thân cây (phát súng của phía bên kia). */
const FarFlash: React.FC<{x: number; y: number; at?: number; s?: number}> = ({x, y, at, s = 1}) => {
  const frame = useCurrentFrame();
  if (at === undefined || frame < at || frame > at + 5) {
    return null;
  }
  const k = 1 - (frame - at) / 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
      <circle r={60} fill="#fff4b0" opacity={0.6} />
      <path d="M -70 0 L 0 -14 L 70 0 L 0 14 Z M 0 -50 L 10 0 L 0 50 L -10 0 Z" fill="#ffd34a" />
    </g>
  );
};

/** L01–L04: xạ thủ nằm trong tuyết; phía xa có kẻ thấy anh trước. */
export const SniperPanel: React.FC<{enemyAt?: number; hit?: number; fire?: number[]}> = ({enemyAt, hit, fire = []}) => (
  <SnowForest seed="sn1" horizon={600}>
    <Svg>
      <FarFlash x={1520} y={560} at={enemyAt} s={0.8} />
      <ProneSniper x={820} y={860} s={2.2} hit={hit} fire={fire} />
    </Svg>
  </SnowForest>
);

/** L05: hai đồng đội kéo xe trượt tuyết qua rừng, từ phải sang trái. */
export const SledPanel: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - from);
  const x = 1500 - t * 3.2;
  const step = Math.sin(t / 5);
  return (
    <SnowForest seed="sn2" horizon={560} snow={150}>
      <Svg>
        <g transform={`translate(${x} 0)`}>
          <Sled x={330} y={960} s={1.8} />
          <Character x={-180} y={980 + 6 * Math.abs(step)} scale={1.6} outfit="snow" hat="hood" expr="worried" lean={-14} flip armL={{a: 120, bend: 0.2}} armR={{a: 70}} seed={11} />
          <Character x={70} y={980 + 6 * Math.abs(Math.cos(t / 5))} scale={1.55} outfit="snow" hat="hood" expr="stern" lean={-12} flip armL={{a: 110}} armR={{a: 60}} seed={12} />
        </g>
      </Svg>
    </SnowForest>
  );
};

/** L11–L12: nông trại ở Rautjärvi. */
export const FarmPanel: React.FC<{talkAt?: number}> = () => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#bcd5e2" />
      <circle cx={1500} cy={180} r={80} fill="#f7e7b4" />
      {new Array(18).fill(0).map((_, i) => (
        <Pine key={i} x={i * 115 - 20} y={560 + (i % 3) * 8} h={240 + (i % 4) * 30} fill="#5d7a5e" snow={false} />
      ))}
      <path d="M 0 560 Q 600 520 1100 560 T 1920 550 L 1920 1080 L 0 1080 Z" fill="#c9c08a" stroke={C.ink} strokeWidth={5} />
      {new Array(10).fill(0).map((_, i) => (
        <path key={i} d={`M ${-100 + i * 220} 1080 L ${300 + i * 140} 600`} stroke="#b0a66f" strokeWidth={6} />
      ))}
      <g transform="translate(1180 360)">
        <path d="M 0 200 L 0 60 L 160 -20 L 320 60 L 320 200 Z" fill="#9b3b2c" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -20 70 L 160 -40 L 340 70" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <rect x={120} y={100} width={80} height={100} fill="#6e2a20" stroke={C.ink} strokeWidth={5} />
        <path d="M 120 100 L 200 200 M 200 100 L 120 200" stroke="#e8dcc0" strokeWidth={5} />
      </g>
      <Character x={700} y={980} scale={1.9} outfit="shirt" hat="cap" expr="neutral" armL={{a: 15}} armR={{a: 160, bend: -0.6, len: 70}} seed={21} />
      <Rifle x={760} y={520} s={0.6} rot={-62} />
    </Svg>
  </AbsoluteFill>
);

/** L26–L29: phía bên kia khoảng rừng. Lính Hồng quân run, một người ngã, người kia nhìn quanh. */
export const PovPanel: React.FC<{dropAt: number; turnAt: number}> = ({dropAt, turnAt}) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [dropAt, dropAt + 10], [0, 1], clamp);
  const look = frame < turnAt ? -0.6 : Math.sin((frame - turnAt) / 9) * 0.9;
  return (
    <SnowForest seed="pov" horizon={520} snow={160} dim={0.12}>
      <Svg>
        <path d="M 0 860 Q 500 800 960 840 T 1920 830 L 1920 1080 L 0 1080 Z" fill="#e3e9ee" stroke={C.ink} strokeWidth={5} />
        <g transform={`translate(${1320 + 60 * d} ${1010 + 30 * d}) rotate(${80 * d}) translate(-1320 -1010)`}>
          <Character x={1320} y={1010} scale={2.1} outfit="greatcoat" hat="ushanka" expr={d > 0.3 ? 'blank' : 'worried'} tremble={d > 0 ? 0 : 0.8} armL={{a: 25}} armR={{a: 30}} seed={31} />
        </g>
        <Character
          x={640}
          y={1030}
          scale={2.3}
          outfit="greatcoat"
          hat="ushanka"
          expr={frame < dropAt ? 'worried' : 'scared'}
          tremble={frame < dropAt ? 0.9 : 1}
          look={[look, -0.1]}
          armL={{a: 30, bend: 0.5}}
          armR={{a: 40, bend: 0.5}}
          sweat={frame >= dropAt}
          seed={32}
        />
      </Svg>
    </SnowForest>
  );
};

/** L33: một ống ngắm loé sáng bên kia khoảng rừng. */
export const GlintPanel: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const k = frame < at ? 0 : 0.5 + 0.5 * Math.sin((frame - at) / 4);
  return (
    <SnowForest seed="gl" horizon={620} snow={80}>
      <Svg>
        <g transform="translate(1180 600)" opacity={k}>
          <circle r={40} fill="#fffbe0" opacity={0.7} />
          <path d="M -110 0 L 110 0 M 0 -70 L 0 70" stroke="#fffbe6" strokeWidth={8} strokeLinecap="round" />
        </g>
      </Svg>
    </SnowForest>
  );
};

/** L53: người lính chứng kiến qua ống nhòm, kẻ địch ở xa ngã xuống. */
export const WitnessPanel: React.FC<{fallAt: number}> = ({fallAt}) => {
  const frame = useCurrentFrame();
  const f = interpolate(frame, [fallAt, fallAt + 8], [0, 1], clamp);
  return (
    <SnowForest seed="wt" horizon={600} snow={70}>
      <Svg>
        <g transform={`translate(1400 700) rotate(${-80 * f})`}>
          <Character x={0} y={0} scale={0.6} outfit="greatcoat" hat="ushanka" expr="blank" seed={41} />
        </g>
        <Character
          x={520}
          y={1060}
          scale={2.2}
          outfit="snow"
          hat="hood"
          expr="focused"
          armL={{a: 150, bend: -0.7, len: 70}}
          armR={{a: 150, bend: -0.7, len: 70}}
          seed={42}
        />
        <g transform="translate(560 540)">
          <rect x={-70} y={-30} width={60} height={50} rx={10} fill="#2a2d31" stroke={C.ink} strokeWidth={6} />
          <rect x={10} y={-30} width={60} height={50} rx={10} fill="#2a2d31" stroke={C.ink} strokeWidth={6} />
        </g>
      </Svg>
    </SnowForest>
  );
};

/** L61: giường bệnh, băng quấn hàm, máy đo nhịp tim. */
export const HospitalPanel: React.FC<{wakeAt: number}> = ({wakeAt}) => {
  const frame = useCurrentFrame();
  const awake = frame >= wakeAt;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = i * 8;
    const ph = (i + frame * 2) % 30;
    const y = ph === 10 ? -50 : ph === 11 ? 40 : ph === 12 ? -14 : 0;
    pts.push(`${x} ${y}`);
  }
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#d8dcd2" />
        <rect y={760} width={W} height={320} fill="#b9b3a2" />
        <rect x={1220} y={140} width={420} height={300} fill="#a9cfe4" stroke={C.ink} strokeWidth={8} />
        <path d="M 1430 140 L 1430 440 M 1220 290 L 1640 290" stroke={C.ink} strokeWidth={6} />
        <g transform="translate(260 620)">
          <rect x={0} y={60} width={980} height={70} rx={10} fill="#e9e6dc" stroke={C.ink} strokeWidth={6} />
          <rect x={-20} y={-80} width={40} height={300} rx={8} fill="#8b9096" stroke={C.ink} strokeWidth={6} />
          <rect x={960} y={0} width={40} height={220} rx={8} fill="#8b9096" stroke={C.ink} strokeWidth={6} />
          <path d="M 260 60 Q 560 -40 940 40 L 950 70 L 250 70 Z" fill="#f3f1ea" stroke={C.ink} strokeWidth={6} />
          <ellipse cx={130} cy={40} rx={120} ry={40} fill="#ffffff" stroke={C.ink} strokeWidth={6} />
        </g>
        <g transform="translate(400 640) rotate(-90)">
          <Character x={0} y={0} scale={1.05} headOnly expr={awake ? 'blank' : 'neutral'} seed={51} />
          <path d="M -70 -200 Q 0 -150 70 -200 L 70 -175 Q 0 -128 -70 -175 Z" fill="#ffffff" stroke={C.ink} strokeWidth={5} />
          {!awake ? <rect x={-50} y={-252} width={100} height={30} fill={C.skin} /> : null}
          {!awake ? <path d="M -36 -236 L -10 -236 M 10 -236 L 36 -236" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /> : null}
        </g>
        <g transform="translate(1380 520)">
          <rect x={-40} y={-60} width={560} height={260} rx={16} fill="#1d2a26" stroke={C.ink} strokeWidth={8} />
          <path d={`M 0 70 L ${pts.join(' L ')}`} transform="translate(0 70)" fill="none" stroke="#62ff8f" strokeWidth={5} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** Con chó săn đơn giản (spitz Phần Lan), quay sang phải. */
const Dog: React.FC<{x: number; y: number; s?: number; wag: number}> = ({x, y, s = 1, wag}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <path d={`M -120 -60 Q ${-170 + wag * 10} -130 ${-140 + wag * 14} -150`} fill="none" strokeWidth={14} stroke="#c4672f" />
    <ellipse cx={-40} cy={-60} rx={100} ry={44} fill="#d9803f" />
    {[-110, -70, 10, 40].map((lx) => (
      <path key={lx} d={`M ${lx} -30 L ${lx} 0`} />
    ))}
    <circle cx={70} cy={-100} r={40} fill="#d9803f" />
    <path d="M 50 -132 L 56 -170 L 76 -138 M 82 -134 L 98 -168 L 104 -130" fill="#d9803f" />
    <path d="M 100 -96 L 134 -86 L 102 -78" fill="#f2e2cc" />
    <circle cx={84} cy={-108} r={5} fill={C.ink} stroke="none" />
  </g>
);

/** L68: Simo về già, đi săn với chó, bóng nai sừng trong rừng. */
export const OldManPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const wag = Math.sin(frame / 3);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#d7d2bf" />
        {new Array(16).fill(0).map((_, i) => (
          <Pine key={i} x={i * 130} y={640 + (i % 2) * 20} h={420 + (i % 3) * 50} fill={i % 3 ? '#4f6650' : '#62775c'} snow={false} />
        ))}
        <path d="M 0 640 Q 700 600 1920 650 L 1920 1080 L 0 1080 Z" fill="#9e9a6c" stroke={C.ink} strokeWidth={5} />
        <g transform="translate(1520 610)" fill="#3a3326" opacity={0.85}>
          <ellipse cx={0} cy={0} rx={110} ry={56} />
          <rect x={-90} y={20} width={16} height={110} />
          <rect x={60} y={20} width={16} height={110} />
          <path d="M 90 -20 Q 140 -60 170 -30 L 150 10 Z" />
          <path d="M 150 -50 Q 120 -120 70 -110 Q 110 -90 130 -60 Q 160 -130 210 -110 Q 180 -90 160 -50 Z" />
        </g>
        <Character x={720} y={1000} scale={1.9} outfit="shirt" hat="cap" hair="old" expr="smirk" armL={{a: 20}} armR={{a: 40}} seed={61} />
        <Dog x={1060} y={990} s={1.2} wag={wag} />
        <Dog x={360} y={1010} s={1.0} wag={-wag} />
      </Svg>
    </AbsoluteFill>
  );
};

/** L73: khoảng rừng trống, chỉ còn bờ tuyết đóng băng. */
export const EmptyClearingPanel: React.FC = () => (
  <SnowForest seed="sn1" horizon={600} snow={90}>
    <Svg>
      <path d="M 1000 960 Q 1150 830 1350 860 Q 1460 880 1520 960 Z" fill="#eaf4fb" stroke={C.ink} strokeWidth={8} />
      <path d="M 1080 920 Q 1200 860 1330 880" fill="none" stroke="#bfe0f5" strokeWidth={10} strokeLinecap="round" />
      <path d="M 560 1000 Q 700 990 860 1000" fill="none" stroke={SNOW.shade} strokeWidth={10} strokeLinecap="round" />
    </Svg>
  </SnowForest>
);
