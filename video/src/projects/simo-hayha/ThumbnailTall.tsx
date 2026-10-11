import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Rifle, Snowfall, SnowForest} from '../../art/Winter';
import {Character} from '../../components/Character';
import {Grain, Vignette} from '../../components/Overlays';
import {outline} from '../../components/Text';
import {FONT} from '../../lib/fonts';
import {C} from '../../lib/theme';
import {Stamp} from '../../vox/marks';

// Ảnh bìa TikTok 1080x1920. Lưới hồ sơ TikTok cắt còn 3:4 ở giữa (y 240–1680),
// nên mọi thứ quan trọng nằm trong vùng đó; đáy khung để trống cho chữ và nút của TikTok.
export const SimoThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: -420, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: '50% 0'}}>
      <SnowForest seed="thumbT" horizon={600} snow={0} dim={0.3} nearTrees={false} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,18,28,0.75) 0%, rgba(12,18,28,0.2) 35%, rgba(12,18,28,0.1) 65%, rgba(12,18,28,0.8) 100%)'}} />
    <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Character x={560} y={2010} scale={3.7} outfit="snow" hat="hood" expr="stern" seed={9} />
      <Rifle x={40} y={1540} s={1.3} rot={-4} />
      <ellipse cx={400} cy={1440} rx={170} ry={58} fill="none" stroke="#e8322a" strokeWidth={13} transform="rotate(-4 400 1440)" />
    </svg>
    <Snowfall count={90} seed="thsnT" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT.display, fontSize: 330, lineHeight: 1, color: C.mustard, textShadow: outline(13), transform: 'rotate(-4deg)'}}>500+</div>
    <div style={{position: 'absolute', left: 200, top: 625, width: 680, height: 190, background: 'rgba(244,246,248,0.88)', transform: 'rotate(-6deg)', boxShadow: '10px 14px 0 rgba(0,0,0,0.4)'}} />
    <Stamp x={540} y={720} text="NO SCOPE" at={-30} rot={-6} size={130} color="#e8322a" />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 1590,
        transform: 'translateX(-50%) rotate(-2deg)',
        padding: '8px 26px',
        background: '#f4f6f8',
        fontFamily: FONT.display,
        fontSize: 84,
        letterSpacing: 4,
        whiteSpace: 'nowrap',
        color: C.ink,
        border: `8px solid ${C.ink}`,
        boxShadow: '10px 14px 0 rgba(0,0,0,0.45)',
      }}
    >
      THE WHITE DEATH
    </div>
    <Vignette strength={0.45} />
    <Grain opacity={0.08} />
  </AbsoluteFill>
);
