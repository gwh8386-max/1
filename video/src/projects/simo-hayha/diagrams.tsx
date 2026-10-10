import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pine} from '../../art/Winter';
import {Rifle} from '../../art/Winter';
import {FONT} from '../../lib/fonts';
import {C} from '../../lib/theme';

// Sơ đồ, biểu đồ, tư liệu vẽ tay của video Simo Häyhä (vẽ trong khung w x h của mảnh giấy).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const RED = '#c8281e';

const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) {
    return null;
  }
  const s = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 190, mass: 0.6}});
  return <div style={{position: 'absolute', transform: `scale(${s})`, opacity: Math.min(1, s * 2), ...style}}>{children}</div>;
};

/** Bảng đếm vạch: các nhóm 5 vạch mọc dần trong [start, end], số lớn đập ra ở `bigAt`. */
export const TallyBoard: React.FC<{w: number; h: number; start: number; end: number; bigAt: number; groups?: number}> = ({w, h, start, end, bigAt, groups = 60}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(interpolate(frame, [start, end], [0, groups * 5], {...clamp, easing: Easing.in(Easing.quad)}));
  const cols = 10;
  const gw = (w - 80) / cols;
  const gh = 64;
  const marks: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5);
    const k = i % 5;
    const gx = 40 + (g % cols) * gw;
    const gy = 40 + Math.floor(g / cols) * gh;
    const j = (random(`tl${i}`) - 0.5) * 6;
    if (k < 4) {
      marks.push(<line key={i} x1={gx + 12 + k * 18 + j} y1={gy + 6} x2={gx + 12 + k * 18 - j} y2={gy + 52} stroke="#2a2a30" strokeWidth={6} strokeLinecap="round" />);
    } else {
      marks.push(<line key={i} x1={gx + 2} y1={gy + 44} x2={gx + 86} y2={gy + 12} stroke="#2a2a30" strokeWidth={6} strokeLinecap="round" />);
    }
  }
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}} opacity={frame >= bigAt ? 0.45 : 1}>
        {marks}
      </svg>
      <Pop at={bigAt} style={{left: 0, right: 0, top: h * 0.22, textAlign: 'center', fontFamily: FONT.display, fontSize: h * 0.5, color: RED, lineHeight: 1, textShadow: '6px 8px 0 rgba(0,0,0,0.25)'}}>
        500+
      </Pop>
    </div>
  );
};

/** Sơ đồ súng trường không ống ngắm, khoảng trống trên thân súng được khoanh đỏ. */
export const RifleDiagram: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    <Rifle x={40} y={h * 0.62} s={(w - 80) / 770} />
    <text x={40} y={60} fontFamily="Special Elite" fontSize={40} fill={C.ink}>
      M/28-30 · IRON SIGHTS
    </text>
  </svg>
);

/** Thước đo chiều cao (5'3" / 1.52 m). */
export const HeightRuler: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at, at + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const top = 60;
  const bot = h - 60;
  const yOf = (cm: number) => bot - ((cm - 0) / 200) * (bot - top);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect x={w * 0.35} y={top} width={w * 0.3} height={bot - top} fill="#f0d98a" stroke={C.ink} strokeWidth={5} />
      {new Array(21).fill(0).map((_, i) => (
        <g key={i}>
          <line x1={w * 0.35} x2={w * 0.35 + (i % 5 === 0 ? 50 : 26)} y1={yOf(i * 10)} y2={yOf(i * 10)} stroke={C.ink} strokeWidth={4} />
          {i % 5 === 0 ? (
            <text x={w * 0.35 + 58} y={yOf(i * 10) + 12} fontFamily="Anton" fontSize={34} fill={C.ink}>
              {i * 10}
            </text>
          ) : null}
        </g>
      ))}
      <line x1={w * 0.08} x2={w * 0.92} y1={yOf(152 * k)} y2={yOf(152 * k)} stroke={RED} strokeWidth={8} strokeDasharray="20 10" />
      <text x={w / 2} y={yOf(152 * k) - 24} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={RED} opacity={k}>
        5&apos;3&quot; · 1.52 M
      </text>
    </svg>
  );
};

/** Bia giấy có các lỗ đạn tụm giữa tâm. */
export const Target: React.FC<{w: number; h: number; shots: number[]}> = ({w, h, shots}) => {
  const frame = useCurrentFrame();
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.44;
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {[1, 0.8, 0.6, 0.4, 0.2].map((k, i) => (
        <circle key={k} cx={cx} cy={cy} r={R * k} fill={i % 2 ? '#f6f1e3' : i === 4 ? '#1d1d1f' : '#2a2a2e'} stroke={C.ink} strokeWidth={4} />
      ))}
      {shots.map((s, i) =>
        frame >= s ? (
          <g key={i}>
            <circle cx={cx + (random(`h${i}`) - 0.5) * R * 0.22} cy={cy + (random(`v${i}`) - 0.5) * R * 0.22} r={12} fill="#f6f1e3" stroke="#000" strokeWidth={4} />
          </g>
        ) : null,
      )}
    </svg>
  );
};

/** Biểu đồ dân số: hai cột, cột Liên Xô vọt lên tràn khung ở `bigAt`. */
export const PopulationChart: React.FC<{w: number; h: number; at: number; bigAt: number}> = ({w, h, at, bigAt}) => {
  const frame = useCurrentFrame();
  const base = h - 120;
  const unit = (base - 140) / 45; // 45 triệu = nửa trên khung, cột Liên Xô tràn ra ngoài
  const fin = interpolate(frame, [at, at + 14], [0, 3.7], clamp);
  const sov = interpolate(frame, [bigAt - 4, bigAt + 26], [0, 170], {...clamp, easing: Easing.out(Easing.cubic)});
  const bw = w * 0.26;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={w * 0.14} y={base - fin * unit} width={bw} height={fin * unit} fill="#2b4c9a" stroke={C.ink} strokeWidth={5} />
        <rect x={w * 0.6} y={base - sov * unit} width={bw} height={sov * unit} fill={RED} stroke={C.ink} strokeWidth={5} />
        <line x1={20} x2={w - 20} y1={base} y2={base} stroke={C.ink} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', left: w * 0.06, width: w * 0.42, top: base - fin * unit - 110, textAlign: 'center', fontFamily: FONT.display, fontSize: 80, color: '#2b4c9a', opacity: fin > 0 ? 1 : 0}}>
        3.7M
      </div>
      <div style={{position: 'absolute', left: w * 0.52, width: w * 0.42, top: 30, textAlign: 'center', fontFamily: FONT.display, fontSize: 110, color: RED, opacity: sov > 1 ? 1 : 0, textShadow: '4px 6px 0 rgba(0,0,0,0.25)'}}>
        {Math.round(sov)}M
      </div>
      <div style={{position: 'absolute', left: w * 0.06, width: w * 0.42, top: base + 16, textAlign: 'center', fontFamily: FONT.display, fontSize: 52, color: C.ink}}>FINLAND</div>
      <div style={{position: 'absolute', left: w * 0.52, width: w * 0.42, top: base + 16, textAlign: 'center', fontFamily: FONT.display, fontSize: 52, color: C.ink}}>USSR</div>
    </div>
  );
};

/**
 * Bản đồ nhìn từ trên: rừng, một con đường duy nhất, đoàn xe Liên Xô bò chậm,
 * lính trượt tuyết lao ra cắt đoàn xe thành từng khúc ("motti"), các khúc phủ sương.
 */
export const MottiMap: React.FC<{w: number; h: number; crawl: number; cutAt: number; freezeAt: number; mottiAt: number}> = ({w, h, crawl, cutAt, freezeAt, mottiAt}) => {
  const frame = useCurrentFrame();
  const road = (x: number) => h * 0.5 + Math.sin(x / 260) * 70;
  const move = interpolate(frame, [crawl, cutAt], [0, 260], clamp);
  const trucks = new Array(14).fill(0).map((_, i) => 140 + i * 105 + move);
  const pockets = [0, 1, 2, 3].map((i) => 260 + i * 380 + move);
  const cutK = interpolate(frame, [cutAt, cutAt + 24], [0, 1], clamp);
  const frz = interpolate(frame, [freezeAt, freezeAt + 20], [0, 1], clamp);
  const trees = new Array(140).fill(0).map((_, i) => ({x: random(`mt${i}`) * w, y: random(`my${i}`) * h}));
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill="#eef2f5" />
      {trees.map((t, i) =>
        Math.abs(t.y - road(t.x)) > 70 ? (
          <g key={i}>
            <circle cx={t.x} cy={t.y} r={20} fill="#55697a" stroke={C.ink} strokeWidth={2.5} />
            <circle cx={t.x - 5} cy={t.y - 5} r={7} fill="#ffffff" opacity={0.7} />
          </g>
        ) : null,
      )}
      <path d={`M 0 ${road(0)} ${new Array(40).fill(0).map((_, i) => `L ${(i + 1) * (w / 40)} ${road((i + 1) * (w / 40))}`).join(' ')}`} fill="none" stroke="#a89a7f" strokeWidth={46} />
      <path d={`M 0 ${road(0)} ${new Array(40).fill(0).map((_, i) => `L ${(i + 1) * (w / 40)} ${road((i + 1) * (w / 40))}`).join(' ')}`} fill="none" stroke="#c9bda4" strokeWidth={30} strokeDasharray="30 18" />
      {trucks.map((x, i) => {
        const y = road(x);
        const ang = (Math.atan(Math.cos(x / 260) * (70 / 260)) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${ang})`}>
            <rect x={-38} y={-16} width={76} height={32} rx={6} fill={i % 4 === 0 ? '#5a5a3c' : '#7a6f4f'} stroke={C.ink} strokeWidth={4} />
            {i % 4 === 0 ? <line x1={0} y1={0} x2={56} y2={0} stroke={C.ink} strokeWidth={8} /> : null}
          </g>
        );
      })}
      {/* lính trượt tuyết lao ra từ hai bên */}
      {cutK > 0
        ? pockets.slice(0, 3).map((px, i) => {
            const gx = px + 190;
            const gy = road(gx);
            return [-1, 1].map((side) => {
              const sy = gy + side * (260 - 230 * cutK);
              return (
                <g key={`${i}${side}`}>
                  <path d={`M ${gx - 20} ${gy + side * 260} L ${gx} ${sy}`} stroke="#ffffff" strokeWidth={6} strokeDasharray="10 10" />
                  <circle cx={gx} cy={sy} r={13} fill="#ffffff" stroke={C.ink} strokeWidth={4} />
                </g>
              );
            });
          })
        : null}
      {cutK >= 1
        ? pockets.slice(0, 3).map((px, i) => <line key={i} x1={px + 190} y1={road(px + 190) - 60} x2={px + 190} y2={road(px + 190) + 60} stroke={RED} strokeWidth={10} strokeLinecap="round" />)
        : null}
      {frz > 0 ? <rect width={w} height={h} fill="#dff1ff" opacity={0.35 * frz} /> : null}
      {frame >= mottiAt
        ? pockets.map((px, i) => {
            const cx = px;
            const k = interpolate(frame, [mottiAt + i * 4, mottiAt + i * 4 + 12], [0, 1], clamp);
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={road(cx)}
                rx={170}
                ry={80}
                fill="none"
                stroke={RED}
                strokeWidth={8}
                pathLength={1}
                strokeDasharray={`${k} 1`}
                transform={`rotate(${(Math.atan(Math.cos(cx / 260) * (70 / 260)) * 180) / Math.PI} ${cx} ${road(cx)})`}
              />
            );
          })
        : null}
    </svg>
  );
};

/** Đống củi xếp (nghĩa gốc của "motti"). */
export const Woodpile: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    {new Array(4).fill(0).map((_, r) =>
      new Array(6 - (r % 2)).fill(0).map((__, i) => {
        const cx = w * 0.12 + i * (w * 0.15) + (r % 2) * w * 0.075;
        const cy = h * 0.8 - r * h * 0.17;
        return (
          <g key={`${r}${i}`}>
            <circle cx={cx} cy={cy} r={h * 0.085} fill="#b7864f" stroke={C.ink} strokeWidth={4} />
            <circle cx={cx} cy={cy} r={h * 0.045} fill="none" stroke="#7b5531" strokeWidth={3} />
          </g>
        );
      }),
    )}
  </svg>
);

/** Thước tuyết ngang thắt lưng một người. */
export const SnowDepth: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const snowTop = h - 60 - (h * 0.42) * k;
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${w / 2} ${h - 60})`}>
        <circle cx={0} cy={-h * 0.78} r={h * 0.08} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <path d={`M ${-h * 0.09} ${-h * 0.68} Q 0 ${-h * 0.72} ${h * 0.09} ${-h * 0.68} L ${h * 0.1} ${-h * 0.3} L ${-h * 0.1} ${-h * 0.3} Z`} fill="#7a6f4f" stroke={C.ink} strokeWidth={5} />
        <path d={`M ${-h * 0.05} ${-h * 0.3} L ${-h * 0.06} 0 M ${h * 0.05} ${-h * 0.3} L ${h * 0.06} 0`} stroke={C.ink} strokeWidth={10} />
      </g>
      <path d={`M 0 ${snowTop} Q ${w / 2} ${snowTop - 30} ${w} ${snowTop} L ${w} ${h} L 0 ${h} Z`} fill="#ffffff" stroke={C.ink} strokeWidth={5} opacity={0.96} />
      <text x={w - 30} y={snowTop - 20} textAnchor="end" fontFamily="Anton" fontSize={48} fill={RED} opacity={k}>
        WAIST-DEEP
      </text>
    </svg>
  );
};

/** Hai đầu người nhìn ngang: có ống ngắm phải ngóc đầu cao hơn vài inch. */
export const HeadHeight: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at, at + 12], [0, 1], clamp);
  const ground = h * 0.78;
  const head = (cx: number, lift: number, scope: boolean) => (
    <g>
      <path d={`M ${cx - 260} ${ground} Q ${cx - 120} ${ground - 40 - lift * 0.5} ${cx} ${ground - 40 - lift}`} stroke="#f4f6f8" strokeWidth={60} strokeLinecap="round" fill="none" />
      <circle cx={cx} cy={ground - 80 - lift} r={52} fill="#f4f6f8" stroke={C.ink} strokeWidth={5} />
      <circle cx={cx + 22} cy={ground - 82 - lift} r={7} fill={C.ink} />
      <Rifle x={cx - 140} y={ground - 50 - lift * 0.4} s={0.42} scope={scope} />
    </g>
  );
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect x={0} y={ground} width={w} height={h - ground} fill="#ffffff" />
      <line x1={0} x2={w} y1={ground} y2={ground} stroke={C.ink} strokeWidth={5} />
      {head(w * 0.3, 0, false)}
      {head(w * 0.75, 70, true)}
      <text x={w * 0.3} y={h - 30} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.ink}>
        IRON SIGHTS
      </text>
      <text x={w * 0.75} y={h - 30} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.ink}>
        SCOPE
      </text>
      <g opacity={k}>
        <line x1={w * 0.88} x2={w * 0.88} y1={ground - 132} y2={ground - 132 - 70} stroke={RED} strokeWidth={8} />
        <line x1={w * 0.85} x2={w * 0.91} y1={ground - 132} y2={ground - 132} stroke={RED} strokeWidth={8} />
        <line x1={w * 0.85} x2={w * 0.91} y1={ground - 202} y2={ground - 202} stroke={RED} strokeWidth={8} />
        <text x={w * 0.9} y={ground - 225} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={RED}>
          +3–4&quot;
        </text>
      </g>
    </svg>
  );
};

/** Mặt cắt hầm tuyết: tay nén tuyết, nước tưới đóng băng, xạ thủ nằm sau. */
export const SnowCross: React.FC<{w: number; h: number; packAt: number; iceAt: number}> = ({w, h, packAt, iceAt}) => {
  const frame = useCurrentFrame();
  const pack = interpolate(frame, [packAt, packAt + 20], [0, 1], clamp);
  const ice = interpolate(frame, [iceAt, iceAt + 14], [0, 1], clamp);
  const pour = frame >= iceAt - 16 && frame < iceAt + 6;
  const ground = h * 0.72;
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill="#dfe7ee" />
      <rect y={ground} width={w} height={h - ground} fill="#ffffff" stroke={C.ink} strokeWidth={5} />
      <path d={`M ${w * 0.5} ${ground} Q ${w * 0.62} ${ground - 170 * pack} ${w * 0.8} ${ground - 120 * pack} Q ${w * 0.9} ${ground - 60 * pack} ${w * 0.94} ${ground} Z`} fill={ice > 0 ? `rgb(${255 - 40 * ice},${255 - 10 * ice},255)` : '#ffffff'} stroke={C.ink} strokeWidth={5} />
      {ice > 0 ? <path d={`M ${w * 0.58} ${ground - 90} Q ${w * 0.66} ${ground - 150} ${w * 0.78} ${ground - 110}`} stroke="#9fd4f5" strokeWidth={10} fill="none" opacity={ice} strokeLinecap="round" /> : null}
      {pour ? (
        <g>
          <path d={`M ${w * 0.68} ${ground - 300} L ${w * 0.7} ${ground - 160}`} stroke="#6fb6e8" strokeWidth={12} strokeDasharray="18 12" strokeDashoffset={-frame * 6} />
          <path d={`M ${w * 0.62} ${ground - 340} L ${w * 0.74} ${ground - 340} L ${w * 0.72} ${ground - 290} L ${w * 0.64} ${ground - 290} Z`} fill="#8b9096" stroke={C.ink} strokeWidth={5} transform={`rotate(25 ${w * 0.68} ${ground - 315})`} />
        </g>
      ) : null}
      {pack > 0 && pack < 1 ? <circle cx={w * 0.68} cy={ground - 160 * pack - 20} r={34} fill="#ffffff" stroke={C.ink} strokeWidth={5} /> : null}
      <path d={`M ${w * 0.06} ${ground} Q ${w * 0.25} ${ground - 50} ${w * 0.44} ${ground - 40} L ${w * 0.48} ${ground}`} fill="#f4f6f8" stroke={C.ink} strokeWidth={5} />
      <circle cx={w * 0.45} cy={ground - 62} r={36} fill="#f4f6f8" stroke={C.ink} strokeWidth={5} />
      <Rifle x={w * 0.36} y={ground - 46} s={0.36} />
      <g opacity={ice}>
        <text x={w * 0.74} y={ground - 200} textAnchor="middle" fontFamily="Anton" fontSize={58} fill="#1f6fa8">
          ICED
        </text>
      </g>
      <text x={w * 0.06} y={70} fontFamily="Special Elite" fontSize={40} fill={C.ink}>
        NO PUFF OF SNOW WHEN HE FIRES
      </text>
    </svg>
  );
};

/**
 * Hơi thở: đầu xạ thủ nhìn nghiêng trong mũ trùm, hơi nước bốc lên thành mây (lộ vị trí).
 * Tới `crossAt`: một nắm tuyết vào miệng, hơi nước tắt, vệt đỏ gạch chỗ mây cũ.
 */
export const Breath: React.FC<{w: number; h: number; crossAt: number}> = ({w, h, crossAt}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [crossAt, crossAt + 10], [0, 1], clamp);
  const snow = interpolate(frame, [crossAt - 8, crossAt], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const ink = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const puff = (i: number) => {
    const p = ((frame + i * 16) % 48) / 48;
    const x = 372 + p * 250;
    const y = 300 - p * 120 + Math.sin(p * 6 + i) * 10;
    const r = 18 + p * 44;
    const op = (1 - p) * (1 - k);
    if (op <= 0.01) {
      return null;
    }
    return (
      <g key={i} opacity={op}>
        <circle cx={x} cy={y} r={r} fill="#ffffff" stroke="#9fb0be" strokeWidth={4} />
        <circle cx={x + r * 0.7} cy={y + r * 0.2} r={r * 0.7} fill="#ffffff" stroke="#9fb0be" strokeWidth={4} />
        <circle cx={x - r * 0.5} cy={y + r * 0.35} r={r * 0.6} fill="#ffffff" stroke="#9fb0be" strokeWidth={4} />
      </g>
    );
  };
  return (
    <svg width={w} height={h} viewBox="0 0 760 500" preserveAspectRatio="xMidYMid meet" style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="brSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3cfda" />
          <stop offset="1" stopColor="#eef2f5" />
        </linearGradient>
      </defs>
      <rect width={760} height={500} fill="url(#brSky)" />
      <path d="M 0 430 Q 380 400 760 425 L 760 500 L 0 500 Z" fill="#ffffff" {...ink} strokeWidth={4} />
      {/* thân áo choàng */}
      <path d="M 40 500 Q 60 400 150 372 Q 230 352 300 380 Q 330 430 340 500 Z" fill="#f4f6f8" {...ink} />
      <path d="M 120 400 Q 140 450 130 500 M 250 380 Q 270 440 262 500" fill="none" stroke="#c4ced8" strokeWidth={5} />
      {/* mũ trùm phía sau */}
      <path d="M 110 300 Q 90 170 200 140 Q 300 120 330 200 Q 345 250 320 330 Q 290 380 210 380 Q 130 380 110 300 Z" fill="#f4f6f8" {...ink} />
      {/* mặt nhìn nghiêng */}
      <path d="M 232 190 Q 300 180 318 232 L 322 252 L 348 276 L 324 286 Q 330 300 326 306 Q 336 314 324 322 Q 318 350 280 352 Q 240 352 228 330 Q 214 260 232 190 Z" fill={C.skin} {...ink} strokeWidth={5} />
      <path d="M 120 290 Q 150 170 236 186" fill="none" stroke="#c4ced8" strokeWidth={6} />
      <ellipse cx={292} cy={242} rx={8} ry={11} fill={C.ink} />
      <circle cx={295} cy={238} r={3} fill="#fff" />
      <path d="M 270 216 L 308 222" {...ink} strokeWidth={6} />
      <path d={k > 0.5 ? 'M 312 314 Q 320 318 326 314' : 'M 310 312 Q 320 320 330 312'} fill="none" {...ink} strokeWidth={5} />
      {/* má phồng khi ngậm tuyết */}
      {snow > 0 ? <path d={`M 300 300 Q ${300 + 16 * snow} 316 300 334`} fill="none" stroke={C.ink} strokeWidth={4} opacity={snow} /> : null}
      {/* hơi nước */}
      {[0, 1, 2].map(puff)}
      {/* nắm tuyết bay vào miệng */}
      {frame >= crossAt - 8 && frame < crossAt + 2 ? (
        <g transform={`translate(${470 - 140 * snow} ${200 + 110 * snow})`}>
          <circle r={18} fill="#ffffff" stroke={C.ink} strokeWidth={4} />
          <circle cx={-5} cy={-5} r={5} fill="#dbe8f2" />
        </g>
      ) : null}
      {/* nhãn trước / sau */}
      <g opacity={1 - k}>
        <text x={520} y={80} textAnchor="middle" fontFamily="Anton" fontSize={46} fill={RED}>
          STEAM = TARGET
        </text>
        <path d="M 520 96 Q 540 140 510 180" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" />
        <path d="M 498 168 L 510 182 L 524 170" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" />
      </g>
      {k > 0 ? (
        <g>
          <g opacity={0.35 * k}>
            <circle cx={500} cy={230} r={46} fill="none" stroke="#9fb0be" strokeWidth={4} strokeDasharray="10 8" />
            <circle cx={560} cy={200} r={34} fill="none" stroke="#9fb0be" strokeWidth={4} strokeDasharray="10 8" />
          </g>
          <path d="M 440 140 L 640 300" stroke={RED} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
          <text x={540} y={80} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={C.ink} opacity={k}>
            SNOW IN MOUTH
          </text>
          <text x={540} y={124} textAnchor="middle" fontFamily="Anton" fontSize={36} fill="#1f6fa8" opacity={k}>
            NO STEAM
          </text>
        </g>
      ) : null}
    </svg>
  );
};

/** Mặt trời rồi mặt trăng quay qua đầu xạ thủ; đồng hồ chạy nhanh. */
export const SunMoon: React.FC<{w: number; h: number; at: number; dur: number}> = ({w, h, at, dur}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  const ang = Math.PI * (1 + p * 2);
  const cx = w / 2;
  const cy = h * 0.82;
  const r = w * 0.38;
  const sx = cx + Math.cos(ang) * r;
  const sy = cy + Math.sin(ang) * r * 0.8;
  const night = p > 0.5;
  const sky = night ? '#1f2a3a' : '#c9d3dc';
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill={sky} />
      {night ? <circle cx={sx} cy={sy} r={44} fill="#f1ecd2" stroke={C.ink} strokeWidth={4} /> : <circle cx={sx} cy={sy} r={50} fill={C.mustard} stroke={C.ink} strokeWidth={4} />}
      <path d={`M 0 ${cy} Q ${w / 2} ${cy - 40} ${w} ${cy} L ${w} ${h} L 0 ${h} Z`} fill="#f3f6f8" stroke={C.ink} strokeWidth={5} />
      <ellipse cx={w * 0.5} cy={cy - 6} rx={w * 0.22} ry={24} fill="#f4f6f8" stroke={C.ink} strokeWidth={5} />
      <circle cx={w * 0.66} cy={cy - 34} r={26} fill="#f4f6f8" stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

/** Cánh rừng nhìn từ trên với các bóng đỏ (lính bắn tỉa đối phương) biến mất từng người. */
export const ForestHunt: React.FC<{w: number; h: number; enter: number; findAt: number; goneAt: number; shellAt?: number}> = ({w, h, enter, findAt, goneAt, shellAt}) => {
  const frame = useCurrentFrame();
  const trees = new Array(90).fill(0).map((_, i) => ({x: random(`fh${i}`) * w, y: random(`fv${i}`) * h}));
  const hunters = new Array(5).fill(0).map((_, i) => ({x0: w * (0.85 + random(`hx${i}`) * 0.1), y0: h * (0.15 + i * 0.17), x1: w * (0.48 + random(`hx1${i}`) * 0.18), gone: goneAt + i * 7}));
  const blasts = shellAt !== undefined ? new Array(12).fill(0).map((_, i) => ({x: w * (0.08 + random(`bx${i}`) * 0.55), y: h * (0.1 + random(`by${i}`) * 0.8), at: shellAt + i * 3})) : [];
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill="#eef2f5" />
      {trees.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={26} fill="#55697a" stroke={C.ink} strokeWidth={3} />
      ))}
      <g transform={`translate(${w * 0.2} ${h * 0.5})`}>
        <circle r={frame >= findAt && frame < goneAt ? 70 + 8 * Math.sin(frame / 3) : 0} fill="none" stroke={RED} strokeWidth={8} />
        <circle r={20} fill="#ffffff" stroke={C.ink} strokeWidth={5} />
      </g>
      {hunters.map((hh, i) => {
        if (frame < enter) {
          return null;
        }
        const p = interpolate(frame, [enter, findAt + 20], [0, 1], clamp);
        const x = hh.x0 + (hh.x1 - hh.x0) * p;
        const op = interpolate(frame, [hh.gone, hh.gone + 6], [1, 0], clamp);
        return (
          <g key={i}>
            <g opacity={op}>
              <circle cx={x} cy={hh.y0} r={22} fill={RED} stroke={C.ink} strokeWidth={4} />
              <path d={`M ${x - 18} ${hh.y0 + 10} L ${x - 70} ${hh.y0 + 18}`} stroke={RED} strokeWidth={10} strokeLinecap="round" />
            </g>
            {frame >= hh.gone ? <path d={`M ${x - 22} ${hh.y0 - 22} L ${x + 22} ${hh.y0 + 22} M ${x + 22} ${hh.y0 - 22} L ${x - 22} ${hh.y0 + 22}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" /> : null}
          </g>
        );
      })}
      {blasts.map((b, i) => {
        if (frame < b.at) {
          return null;
        }
        const k = interpolate(frame, [b.at, b.at + 6, b.at + 30], [0, 1.2, 1], clamp);
        const pts = new Array(14)
          .fill(0)
          .map((_, j) => {
            const a = (j / 14) * Math.PI * 2;
            const r = (j % 2 ? 26 : 62) * k;
            return `${(b.x + Math.cos(a) * r).toFixed(1)},${(b.y + Math.sin(a) * r).toFixed(1)}`;
          })
          .join(' ');
        return (
          <g key={`b${i}`}>
            <circle cx={b.x} cy={b.y} r={70 * k} fill="#6b5a48" opacity={0.25} />
            <polygon points={pts} fill={C.mustard} stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Áo choàng tuyết nhìn từ sau lưng (mũ trùm buông xuống, tay áo, gấu áo có dây rút).
 * Tới `tearAt`: mảnh đạn xé một lỗ ở lưng, sợi vải tưa ra, mảnh vụn bắn ra ngoài.
 */
export const TornCoat: React.FC<{w: number; h: number; tearAt: number}> = ({w, h, tearAt}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [tearAt, tearAt + 5], [0, 1], clamp);
  const fly = interpolate(frame, [tearAt, tearAt + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ink = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const fold = {fill: 'none', stroke: '#c4ced8', strokeWidth: 5, strokeLinecap: 'round' as const};
  const hole = 'M 196 210 L 222 188 L 236 214 L 262 190 L 276 220 L 306 206 L 298 240 L 322 258 L 292 272 L 300 304 L 268 290 L 250 318 L 232 288 L 202 300 L 210 268 L 184 252 L 208 238 Z';
  return (
    <svg width={w} height={h} viewBox="0 -40 500 600" preserveAspectRatio="xMidYMid meet" style={{position: 'absolute', inset: 0}}>
      {/* tay áo */}
      <path d="M 130 120 Q 70 150 40 300 L 30 380 L 92 392 L 112 300 Q 120 250 150 220 Z" fill="#eef1f4" {...ink} />
      <path d="M 370 120 Q 430 150 460 300 L 470 380 L 408 392 L 388 300 Q 380 250 350 220 Z" fill="#eef1f4" {...ink} />
      <path d="M 30 380 L 92 392 L 90 410 L 28 398 Z M 470 380 L 408 392 L 410 410 L 472 398 Z" fill="#dfe5ea" {...ink} strokeWidth={4} />
      {/* thân */}
      <path d="M 130 110 Q 250 86 370 110 L 388 300 Q 400 420 420 500 Q 250 528 80 500 Q 100 420 112 300 Z" fill="#f4f6f8" {...ink} />
      <path d="M 82 486 Q 250 512 418 486" fill="none" stroke="#9aa8b4" strokeWidth={5} strokeDasharray="6 8" />
      <circle cx={250} cy={506} r={7} fill="#9aa8b4" stroke={C.ink} strokeWidth={3} />
      <path d="M 246 512 Q 240 530 232 540 M 254 512 Q 262 530 268 540" fill="none" stroke="#9aa8b4" strokeWidth={4} strokeLinecap="round" />
      <path d="M 170 160 Q 160 330 150 480 M 330 160 Q 340 330 350 480 M 250 340 Q 246 420 250 500" {...fold} />
      {/* mũ trùm buông sau lưng */}
      <path d="M 170 104 Q 170 40 250 36 Q 330 40 330 104 Q 320 170 250 178 Q 180 170 170 104 Z" fill="#eef1f4" {...ink} />
      <path d="M 196 100 Q 250 130 304 100" {...fold} />
      <path d="M 214 70 Q 250 56 286 70" {...fold} />
      {/* lỗ rách */}
      {k > 0 ? (
        <g>
          <ellipse cx={252} cy={252} rx={110 * k} ry={88 * k} fill="#6b5a48" opacity={0.18} />
          <g transform={`translate(252 252) scale(${k}) translate(-252 -252)`}>
            <path d={hole} fill="#4a4136" {...ink} strokeWidth={5} />
            <path d="M 214 232 Q 250 218 290 236 Q 280 270 250 280 Q 220 272 214 232 Z" fill="#7d6a52" opacity={0.85} />
            {[[222, 188, 214, 172], [262, 190, 266, 170], [306, 206, 324, 196], [322, 258, 342, 262], [300, 304, 310, 324], [250, 318, 248, 340], [202, 300, 188, 316], [184, 252, 164, 250]].map(([x1, y1, x2, y2], i) => (
              <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2 - 4} ${x2} ${y2}`} fill="none" stroke="#e1e6ea" strokeWidth={4} strokeLinecap="round" />
            ))}
          </g>
          {fly < 1
            ? new Array(9).fill(0).map((_, i) => {
                const a = (i / 9) * Math.PI * 2 + 0.3;
                const d = 30 + 170 * fly;
                return <rect key={i} x={252 + Math.cos(a) * d - 6} y={252 + Math.sin(a) * d - 4} width={12} height={8} fill={i % 3 ? '#f4f6f8' : '#4a4136'} stroke={C.ink} strokeWidth={2} opacity={1 - fly} transform={`rotate(${i * 40 + fly * 200} ${252 + Math.cos(a) * d} ${252 + Math.sin(a) * d})`} />;
              })
            : null}
        </g>
      ) : null}
    </svg>
  );
};

/** Trang nhật ký (minh hoạ, không phải bản gốc): các dòng viết tay nguệch ngoạc, con số ~500 được khoanh. */
export const DiaryPage: React.FC<{w: number; h: number; circleAt: number}> = ({w, h, circleAt}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [circleAt, circleAt + 12], [0, 1], clamp);
  const scrib = (y: number, len: number, seed: string) => {
    let d = `M 60 ${y}`;
    for (let x = 60; x < 60 + len; x += 26) {
      d += ` q 8 ${-14 - random(`${seed}${x}`) * 10} 13 0 t 13 0`;
    }
    return d;
  };
  return (
    <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, transparent 0 58px, rgba(60,90,160,0.25) 58px 60px)'}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {[110, 170, 230, 350, 410, 470].map((y, i) => (
          <path key={y} d={scrib(y, (w - 160) * (0.55 + 0.4 * random(`dl${i}`)), `d${i}`)} fill="none" stroke="#22305e" strokeWidth={4} strokeLinecap="round" />
        ))}
        <text x={70} y={305} fontFamily="Caveat" fontWeight={700} fontSize={84} fill="#22305e">
          ≈ 500
        </text>
        <ellipse cx={160} cy={280} rx={130} ry={50} fill="none" stroke={RED} strokeWidth={8} pathLength={1} strokeDasharray={`${k} 1`} />
      </svg>
      <div style={{position: 'absolute', right: 30, bottom: 20, fontFamily: FONT.body, fontWeight: 600, fontSize: 24, color: '#6b645a'}}>illustration</div>
    </div>
  );
};

/** So sánh nhịp độ: Häyhä 219 trong ~11 tuần vs Pavlichenko 309 trong ~1 năm. */
export const CompareChart: React.FC<{w: number; h: number; aAt: number; bAt: number}> = ({w, h, aAt, bAt}) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [aAt, aAt + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const b = interpolate(frame, [bAt, bAt + 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const x0 = 60;
  const full = w - 120;
  const row = (y: number, k: number, len: number, color: string, name: string, num: string, span: string) => (
    <g>
      <text x={x0} y={y - 26} fontFamily="Anton" fontSize={52} fill={C.ink}>
        {name}
      </text>
      <rect x={x0} y={y} width={full * len * k} height={70} fill={color} stroke={C.ink} strokeWidth={5} />
      <text x={x0 + full * len * k + 16} y={y + 54} fontFamily="Anton" fontSize={56} fill={color} opacity={k}>
        {num}
      </text>
      <text x={x0} y={y + 120} fontFamily="Special Elite" fontSize={36} fill="#4b463e" opacity={k}>
        {span}
      </text>
    </g>
  );
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <text x={w / 2} y={70} textAnchor="middle" fontFamily="Anton" fontSize={50} fill={C.ink} letterSpacing={3}>
        TIME ON THE JOB
      </text>
      {row(200, a, 11 / 52, RED, 'HÄYHÄ', '219', '≈ 11 WEEKS')}
      {row(440, b, 1, '#2b4c9a', 'PAVLICHENKO', '309', '≈ 1 YEAR')}
    </svg>
  );
};

/** Mẩu báo / truyền đơn có tiêu đề lớn. */
export const Clipping: React.FC<{w: number; h: number; head: string; mast: string; ru?: boolean}> = ({w, h, head, mast, ru}) => (
  <div style={{position: 'absolute', inset: 0, padding: 30, boxSizing: 'border-box', background: ru ? '#e7d9c0' : '#ece6d6'}}>
    <div style={{fontFamily: FONT.display, fontSize: 40, letterSpacing: 6, color: ru ? '#9a2a1c' : '#222', borderBottom: '4px double #333', paddingBottom: 6, textAlign: 'center'}}>{mast}</div>
    <div style={{fontFamily: FONT.display, fontSize: h * 0.2, lineHeight: 1.05, color: '#1a1a1a', marginTop: 18, textAlign: 'center'}}>{head}</div>
    {new Array(6).fill(0).map((_, i) => (
      <div key={i} style={{height: 12, background: 'rgba(40,35,30,0.45)', margin: '14px 0', width: `${70 + random(`cl${head}${i}`) * 30}%`}} />
    ))}
    <svg width={w} height={1} style={{display: 'none'}} />
  </div>
);

/** Biểu đồ tổn thất bằng đầu người: mỗi đầu = 1.000 người. */
export const CasualtyHeads: React.FC<{w: number; h: number; finAt: number; sovAt: number}> = ({w, h, finAt, sovAt}) => {
  const frame = useCurrentFrame();
  const cell = 34;
  const cols = 12;
  const nF = Math.round(interpolate(frame, [finAt, finAt + 20], [0, 25], clamp));
  const nS = Math.round(interpolate(frame, [sovAt, sovAt + 40], [0, 126], clamp));
  const base = h - 120;
  const head = (cx: number, cy: number, key: string, col: string) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={cell * 0.42} fill="#ffffff" stroke={col} strokeWidth={3} />
      <circle cx={cx - 5} cy={cy - 1} r={2.4} fill={C.ink} />
      <circle cx={cx + 5} cy={cy - 1} r={2.4} fill={C.ink} />
    </g>
  );
  const block = (n: number, x0: number, col: string, tag: string) =>
    new Array(n).fill(0).map((_, i) => head(x0 + (i % cols) * cell + cell / 2, base - Math.floor(i / cols) * cell - cell / 2, `${tag}${i}`, col));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {block(nF, 40, '#2b4c9a', 'f')}
        {block(nS, w * 0.5 + 10, RED, 's')}
        {nS >= 126 ? <rect x={w * 0.5 + 10} y={base - 14 * cell - 4 * cell} width={cols * cell} height={4 * cell} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="12 8" /> : null}
        <line x1={20} x2={w - 20} y1={base + 6} y2={base + 6} stroke={C.ink} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', left: 40, width: cols * cell, top: base + 20, textAlign: 'center', fontFamily: FONT.display, fontSize: 46, color: '#2b4c9a'}}>~25,000 FINNS</div>
      <div style={{position: 'absolute', left: w * 0.5 + 10, width: cols * cell, top: base + 20, textAlign: 'center', fontFamily: FONT.display, fontSize: 46, color: RED}}>126,000+ SOVIETS</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center', fontFamily: FONT.script, fontWeight: 700, fontSize: 46, color: '#4b463e'}}>each head = 1,000 dead</div>
      {nS >= 126 ? <div style={{position: 'absolute', left: w * 0.5 + 10, width: cols * cell, top: base - 18 * cell - 10, textAlign: 'center', fontFamily: FONT.marker, fontSize: 40, color: RED}}>+ more?</div> : null}
    </div>
  );
};

/** Phác thảo X-quang hàm có chỉ khâu. */
export const JawXray: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at, at + 20], [0, 1], clamp);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill="#13202a" />
      <path d={`M ${w * 0.2} ${h * 0.3} Q ${w * 0.18} ${h * 0.75} ${w * 0.5} ${h * 0.8} Q ${w * 0.8} ${h * 0.78} ${w * 0.82} ${h * 0.45}`} fill="none" stroke="#cfe3ee" strokeWidth={22} strokeLinecap="round" opacity={0.85} />
      {new Array(8).fill(0).map((_, i) => (
        <rect key={i} x={w * (0.3 + i * 0.055)} y={h * 0.6} width={w * 0.04} height={h * 0.09} rx={6} fill="#e9f3f8" opacity={0.8} />
      ))}
      {new Array(6).fill(0).map((_, i) => {
        const x = w * (0.22 + i * 0.05);
        return <path key={`s${i}`} d={`M ${x} ${h * 0.5} l 18 30 M ${x + 18} ${h * 0.5} l -18 30`} stroke={RED} strokeWidth={5} opacity={k > i / 6 ? 1 : 0} />;
      })}
    </svg>
  );
};

/** Quân hàm lật từ hạ sĩ sang thiếu uý. */
export const RankFlip: React.FC<{w: number; h: number; at: number}> = ({w, h, at}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], clamp);
  const flip = Math.abs(Math.cos(p * Math.PI));
  const after = p > 0.5;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${w / 2} ${h * 0.42}) scale(${flip} 1)`}>
          <rect x={-w * 0.3} y={-h * 0.28} width={w * 0.6} height={h * 0.56} rx={20} fill={after ? '#56603f' : '#6b6e55'} stroke={C.ink} strokeWidth={6} />
          {after ? (
            <g>
              <rect x={-w * 0.24} y={-h * 0.04} width={w * 0.48} height={h * 0.08} fill={C.mustard} stroke={C.ink} strokeWidth={4} />
              <circle cx={0} cy={-h * 0.15} r={h * 0.06} fill={C.mustard} stroke={C.ink} strokeWidth={4} />
            </g>
          ) : (
            [-1, 0, 1].map((i) => <path key={i} d={`M ${-w * 0.18} ${i * h * 0.1 - h * 0.04} L 0 ${i * h * 0.1 + h * 0.04} L ${w * 0.18} ${i * h * 0.1 - h * 0.04}`} fill="none" stroke={C.mustard} strokeWidth={14} />)
          )}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: FONT.display, fontSize: 56, color: C.ink}}>{after ? '2ND LIEUTENANT' : 'CORPORAL'}</div>
    </div>
  );
};

/** Điện thoại bị gạch chéo (đùa nói giảm). */
export const PhoneGag: React.FC<{w: number; h: number; crossAt: number}> = ({w, h, crossAt}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [crossAt, crossAt + 10], [0, 1], clamp);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect x={w * 0.3} y={h * 0.12} width={w * 0.4} height={h * 0.72} rx={30} fill="#26292e" stroke={C.ink} strokeWidth={6} />
      <rect x={w * 0.34} y={h * 0.19} width={w * 0.32} height={h * 0.56} rx={8} fill="#7fc2e8" />
      <text x={w / 2} y={h * 0.5} textAnchor="middle" fontFamily="Anton" fontSize={56} fill="#fff">
        2:00:00
      </text>
      <text x={w / 2} y={h * 0.95} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={54} fill={C.ink}>
        just one check…
      </text>
      <path d={`M ${w * 0.2} ${h * 0.1} L ${w * 0.8} ${h * 0.86} M ${w * 0.8} ${h * 0.1} L ${w * 0.2} ${h * 0.86}`} stroke={RED} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
    </svg>
  );
};

/** Hàng cây nhỏ trang trí (dùng lấp mép bảng). */
export const TreeStrip: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    <rect width={w} height={h} fill="#e8edf1" />
    {new Array(Math.ceil(w / 90)).fill(0).map((_, i) => (
      <Pine key={i} x={i * 90 + 40} y={h - 10} h={h * (0.6 + 0.3 * random(`ts${i}`))} fill="#5f7383" />
    ))}
  </svg>
);
