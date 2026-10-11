import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Character} from '../components/Character';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';
import {Card, Castle, Helmet, Hourglass, Magnifier, MapX, Pyramid, Ribbon, Ship} from './Avatar';

// Ảnh bìa kênh YouTube "Our Story" (2560x1440).
// Vùng an toàn trên mọi thiết bị: 1546x423 ở giữa (x 507–2053, y 508–931) → nhân vật, tên kênh, khẩu hiệu.
// Dải ngang 2560x423 (máy tính) và toàn khung (TV) có thêm các tấm ảnh lịch sử nối dây đỏ.

const W = 2560;
const H = 1440;
const INK = C.ink;
const st = {stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

const Crown = () => (
  <g>
    <rect width={160} height={160} fill="#3b2f5c" />
    <path d="M 26 116 L 20 50 L 54 82 L 80 36 L 106 82 L 140 50 L 134 116 Z" fill={C.mustard} {...st} />
    <rect x={26} y={112} width={108} height={20} fill="#d9a521" {...st} strokeWidth={4} />
    {[54, 80, 106].map((x) => (
      <circle key={x} cx={x} cy={122} r={5} fill={C.blood} />
    ))}
  </g>
);
const Scroll = () => (
  <g>
    <rect width={160} height={160} fill="#d7cdb4" />
    <rect x={30} y={30} width={100} height={100} fill="#f3e8c8" {...st} strokeWidth={4} />
    <rect x={22} y={22} width={116} height={16} rx={8} fill="#c9b27f" {...st} strokeWidth={4} />
    <rect x={22} y={122} width={116} height={16} rx={8} fill="#c9b27f" {...st} strokeWidth={4} />
    {[54, 70, 86, 102].map((y) => (
      <path key={y} d={`M 44 ${y} L ${100 + (y % 3) * 6} ${y}`} stroke="#6b5a3a" strokeWidth={5} strokeLinecap="round" />
    ))}
    <circle cx={110} cy={104} r={12} fill={C.blood} {...st} strokeWidth={3} />
  </g>
);
const Plane = () => (
  <g>
    <rect width={160} height={160} fill="#a9c6d2" />
    <path d="M 20 86 L 140 74 Q 150 80 140 86 L 20 94 Z" fill="#6d6a3a" {...st} strokeWidth={4} />
    <path d="M 70 82 L 56 34 L 76 34 L 96 80 Z M 70 90 L 56 132 L 76 132 L 96 90 Z" fill="#7f7c48" {...st} strokeWidth={4} />
    <path d="M 22 86 L 14 64 L 28 64 L 36 84" fill="#7f7c48" {...st} strokeWidth={4} />
    <circle cx={66} cy={54} r={7} fill={C.blood} />
  </g>
);

export const OurStoryBanner: React.FC<{guides?: boolean}> = ({guides}) => {
  const cyBand = 720;
  // nhân vật bên trái tên kênh, trong vùng an toàn
  const scale = 2.5;
  const charX = 740;
  const charY = 1300;
  const eyeX = charX + 22 * scale;
  const eyeY = charY - 236 * scale;
  const cards: {x: number; y: number; r: number; Icon: React.FC}[] = [
    {x: 110, y: 610, r: -8, Icon: Hourglass},
    {x: 300, y: 820, r: 6, Icon: Pyramid},
    {x: 430, y: 600, r: -4, Icon: Helmet},
    {x: 2140, y: 600, r: 5, Icon: Ship},
    {x: 2270, y: 830, r: -6, Icon: MapX},
    {x: 2450, y: 610, r: 7, Icon: Crown},
    // phía trên và dưới dải (chỉ TV thấy)
    {x: 700, y: 250, r: -6, Icon: Castle},
    {x: 1280, y: 200, r: 4, Icon: Scroll},
    {x: 1860, y: 260, r: -5, Icon: Plane},
    {x: 900, y: 1200, r: 5, Icon: Crown},
    {x: 1660, y: 1210, r: -4, Icon: Pyramid},
  ];
  const strings: [number, number][] = [
    [110, 545],
    [300, 755],
    [430, 535],
    [740, 520],
    [1300, 500],
    [2140, 535],
    [2270, 765],
    [2450, 545],
  ];
  const rays = 36;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Img src={staticFile('vox/board.jpg')} style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', opacity: 0.55}} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="bnGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="0.5" stopColor={C.mustard} />
            <stop offset="1" stopColor="#c9861f" />
          </radialGradient>
          <linearGradient id="bnFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.night} stopOpacity={0.85} />
            <stop offset="0.2" stopColor={C.night} stopOpacity={0} />
            <stop offset="0.8" stopColor={C.night} stopOpacity={0} />
            <stop offset="1" stopColor={C.night} stopOpacity={0.85} />
          </linearGradient>
          <clipPath id="bnBand">
            <rect x={0} y={cyBand - 250} width={W} height={500} />
          </clipPath>
        </defs>
        {/* dải vàng tia nắng kiểu áp phích cổ, chạy ngang giữa */}
        <g clipPath="url(#bnBand)">
          <rect x={0} y={cyBand - 250} width={W} height={500} fill="url(#bnGlow)" />
          {new Array(rays).fill(0).map((_, i) => {
            const a0 = (i / rays) * Math.PI * 2;
            const a1 = ((i + 0.5) / rays) * Math.PI * 2;
            const R = 2000;
            return <path key={i} d={`M ${charX} ${eyeY} L ${charX + Math.cos(a0) * R} ${eyeY + Math.sin(a0) * R} L ${charX + Math.cos(a1) * R} ${eyeY + Math.sin(a1) * R} Z`} fill="#e9a52a" opacity={0.5} />;
          })}
          <rect x={0} y={cyBand - 250} width={W} height={500} fill="url(#bnFade)" />
        </g>
        <path d={`M 0 ${cyBand - 250} L ${W} ${cyBand - 250} M 0 ${cyBand + 250} L ${W} ${cyBand + 250}`} stroke={INK} strokeWidth={12} />
        <path d={`M 0 ${cyBand - 232} L ${W} ${cyBand - 232} M 0 ${cyBand + 232} L ${W} ${cyBand + 232}`} stroke="#fff3cf" strokeWidth={5} strokeDasharray="4 16" opacity={0.75} />

        {/* dây đỏ nối các manh mối */}
        <path d={`M ${strings.map(([x, y]) => `${x} ${y}`).join(' L ')}`} fill="none" stroke="#b5221a" strokeWidth={8} strokeLinejoin="round" />
        {cards.map((cd, i) => (
          <Card key={i} cx={cd.x} cy={cd.y} rot={cd.r} size={170} Icon={cd.Icon} />
        ))}

        {/* nhân vật kể chuyện soi kính lúp */}
        <Character x={charX} y={charY} scale={scale} headOnly expr="smirk" headTilt={-4} seed={4} />
        <Magnifier eyeX={eyeX} eyeY={eyeY} lensR={34 * scale} />

        <Ribbon cx={1500} cy={670} w={880} h={196} text="OUR STORY" size={164} />
      </svg>
      {/* khẩu hiệu trên dải giấy đánh máy */}
      <div
        style={{
          position: 'absolute',
          left: 1500,
          top: 845,
          transform: 'translate(-50%, -50%) rotate(-2deg)',
          padding: '10px 34px',
          background: '#f3eee3',
          fontFamily: FONT.typewriter,
          fontSize: 50,
          letterSpacing: 3,
          color: INK,
          whiteSpace: 'nowrap',
          boxShadow: '8px 12px 0 rgba(0,0,0,0.4)',
          border: `4px solid ${INK}`,
        }}
      >
        HISTORY, ONE CLUE AT A TIME
      </div>
      {guides ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <rect x={507} y={508} width={1546} height={423} fill="none" stroke="#00e5ff" strokeWidth={6} strokeDasharray="20 12" />
          <rect x={0} y={508} width={W} height={423} fill="none" stroke="#ff00d4" strokeWidth={4} strokeDasharray="10 10" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
