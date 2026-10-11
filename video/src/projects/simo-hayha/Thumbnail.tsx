import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Rifle, Snowfall, SnowForest} from '../../art/Winter';
import {Character} from '../../components/Character';
import {Grain, Vignette} from '../../components/Overlays';
import {outline} from '../../components/Text';
import {FONT} from '../../lib/fonts';
import {C} from '../../lib/theme';
import {Stamp} from '../../vox/marks';

// Ảnh thumbnail YouTube (1920x1080, xuất ra 1280x720): xạ thủ nằm trong tuyết, số "500+" thật to, "NO SCOPE".
export const SimoThumb: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <SnowForest seed="thumb" horizon={600} snow={0} dim={0.3} nearTrees={false} />
    {/* lớp tối phía trái để chữ nổi */}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(12,18,28,0.72) 0%, rgba(12,18,28,0.35) 45%, rgba(0,0,0,0) 70%)'}} />
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      {/* cận mặt Simo trong mũ trùm (sáng hơn nền), mắt liếc sang trái */}
      <Character x={1430} y={1560} scale={4.3} outfit="snow" hat="hood" expr="stern" look={[-1, 0.2]} seed={9} />
      {/* súng không ống ngắm vắt ngang phía trước */}
      <Rifle x={760} y={1010} s={1.45} rot={-3} />
    </svg>
    <Snowfall count={110} seed="thsn" />
    <div style={{position: 'absolute', left: 70, top: 40, fontFamily: FONT.display, fontSize: 400, lineHeight: 1, color: C.mustard, textShadow: outline(14), transform: 'rotate(-4deg)'}}>500+</div>
    <Stamp x={470} y={610} text="NO SCOPE" at={-30} rot={-6} size={150} color="#e8322a" />
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: 790,
        padding: '10px 28px',
        background: '#f4f6f8',
        fontFamily: FONT.display,
        fontSize: 96,
        letterSpacing: 4,
        color: C.ink,
        border: `8px solid ${C.ink}`,
        transform: 'rotate(-2deg)',
        boxShadow: '10px 14px 0 rgba(0,0,0,0.45)',
      }}
    >
      THE WHITE DEATH
    </div>
    {/* khoanh đỏ chỗ lẽ ra là ống ngắm */}
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <ellipse cx={1150} cy={895} rx={190} ry={62} fill="none" stroke="#e8322a" strokeWidth={14} transform="rotate(-3 1150 895)" />
    </svg>
    <Vignette strength={0.5} />
    <Grain opacity={0.08} />
  </AbsoluteFill>
);
