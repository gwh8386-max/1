import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Character} from '../components/Character';
import {outline} from '../components/Text';
import {FONT} from '../lib/fonts';
import {C} from '../lib/theme';
import {Pin} from '../vox/paper';

// Avatar kênh "Our Story" (vuông, nền tảng tự cắt tròn). Mọi thứ quan trọng nằm trong vòng tròn nội tiếp.
// tight: bản cho TikTok (avatar hiện rất nhỏ) → mặt to hơn, chữ to hơn.
export const OurStoryAvatar: React.FC<{tight?: boolean}> = ({tight}) => {
  const S = 1080;
  const headScale = tight ? 3.3 : 2.9;
  return (
    <AbsoluteFill style={{background: C.night}}>
      {/* nền: bảng điều tra mờ, hắt sáng vàng ở giữa */}
      <Img src={staticFile('vox/board.jpg')} style={{position: 'absolute', inset: 0, width: S, height: S, objectFit: 'cover', opacity: 0.55}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(240,183,47,0.95) 0%, rgba(240,183,47,0.85) 34%, rgba(29,40,54,0.92) 62%)`}} />
      {/* sợi dây đỏ chéo phía sau */}
      <svg viewBox={`0 0 ${S} ${S}`} style={{position: 'absolute', inset: 0}}>
        <path d="M 120 300 Q 540 420 960 260" fill="none" stroke="#b5221a" strokeWidth={10} strokeLinecap="round" />
        <circle cx={120} cy={300} r={18} fill="#c0261b" stroke={C.ink} strokeWidth={4} />
        <circle cx={960} cy={260} r={18} fill="#c0261b" stroke={C.ink} strokeWidth={4} />
      </svg>
      {/* nhân vật kể chuyện của kênh: đầu tròn, kính tròn, nhướng mày */}
      <svg viewBox={`0 0 ${S} ${S}`} style={{position: 'absolute', inset: 0}}>
        <Character x={540} y={tight ? 1290 : 1230} scale={headScale} headOnly glasses expr="smirk" headTilt={-6} seed={4} />
      </svg>
      {/* ruy băng tên kênh */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: tight ? 740 : 720,
          transform: 'translateX(-50%) rotate(-4deg)',
          padding: tight ? '6px 40px 10px' : '4px 36px 8px',
          background: C.blood,
          border: `10px solid ${C.ink}`,
          boxShadow: '12px 16px 0 rgba(0,0,0,0.45)',
          fontFamily: FONT.display,
          fontSize: tight ? 150 : 136,
          letterSpacing: 4,
          lineHeight: 1.05,
          color: C.white,
          textShadow: outline(5),
          whiteSpace: 'nowrap',
        }}
      >
        OUR STORY
      </div>
      <div style={{position: 'absolute', left: 0, top: 0}}>
        <Pin x={tight ? 210 : 230} y={tight ? 760 : 740} s={1.6} />
      </div>
    </AbsoluteFill>
  );
};
