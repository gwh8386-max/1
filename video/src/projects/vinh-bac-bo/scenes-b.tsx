import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {Camera} from '../../components/Camera';
import {Grain, lerp, Vignette} from '../../components/Overlays';
import {Sfx} from '../../components/Sfx';
import {Banner, Counter, DateStamp, NameTag, outline, PunchText, Typewriter} from '../../components/Text';
import {H, W} from '../../art/common';
import {Cabin, CeilingFan, DeskLamp, HanoiRoom, Study, Teacup, TypewriterMachine} from '../../art/Interior';
import {CarrierDeck, Coast, Congress, DrawerDoc, FallingPlane, Parachute, WhiteHouse} from '../../art/Places';
import {Blip, Radar} from '../../art/Radar';
import {FONT} from '../../lib/fonts';
import {C} from '../../lib/theme';
import {useClock} from '../../lib/timeline';

/** Lia nhanh giữa hai khung hình bên trong một cảnh, quanh frame `at`. */
const WhipBetween: React.FC<{at: number; a: React.ReactNode; b: React.ReactNode; dur?: number}> = ({at, a, b, dur = 12}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at - dur / 2, at + dur / 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const blur = Math.sin(k * Math.PI) * 28;
  return (
    <AbsoluteFill>
      {k < 1 ? <AbsoluteFill style={{transform: `translateX(${-k * 100}%)`, filter: blur ? `blur(${blur}px)` : undefined}}>{a}</AbsoluteFill> : null}
      {k > 0 ? <AbsoluteFill style={{transform: `translateX(${(1 - k) * 100}%)`, filter: blur ? `blur(${blur}px)` : undefined}}>{b}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C08
const TELEGRAM = [
  {line: 'L15', text: 'THỜI TIẾT LÀM RADAR NHIỄU.\nSONAR QUÁ HĂNG.'},
  {line: 'L16', text: 'CHƯA AI TẬN MẮT THẤY TÀU ĐỊCH.'},
  {line: 'L17', text: 'ĐỀ NGHỊ KIỂM TRA KỸ\nTRƯỚC KHI LÀM GÌ THÊM.'},
];

export const S08: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const paperIn = c.at('L14', 'đánh');
  const p = interpolate(frame, [paperIn, paperIn + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  const typing = TELEGRAM.some((t) => frame >= c.at(t.line) && frame <= c.end(t.line));
  const tap = typing ? Math.sin(frame * 1.9) : 0;
  const expr = frame < c.at('L16') ? 'focused' : frame < c.at('L17') ? 'stern' : 'worried';
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.06]} x={40} y={50} duration={c.total} handheld={0.4}>
        <Cabin
          front={
            <>
              <DeskLamp x={170} y={430} />
              <TypewriterMachine x={560} y={905} s={0.85} paperUp={lerp(frame, c.at('L15'), c.end('L17'), 0, 1)} />
            </>
          }
        >
          <Character x={560} y={975} scale={1.5} outfit="officer" hat="officer" expr={expr} armL={{a: 28 + tap * 3, bend: -0.1, len: 96}} armR={{a: 28 - tap * 3, bend: -0.1, len: 96}} look={[0, 0.6]} seed={31} />
        </Cabin>
      </Camera>
      <div
        style={{
          position: 'absolute',
          left: 1030,
          top: 150,
          width: 800,
          height: 780,
          background: '#fbf7ea',
          border: `7px solid ${C.ink}`,
          boxShadow: `14px 16px 0 ${C.ink}`,
          padding: '46px 52px',
          transform: `translateX(${(1 - p) * 1100}px) rotate(${2 - p * 4}deg)`,
        }}
      >
        <div style={{fontFamily: FONT.display, fontSize: 54, color: C.rust, letterSpacing: 2}}>ĐIỆN KHẨN · USS MADDOX</div>
        <div style={{height: 6, background: C.ink, margin: '14px 0 30px'}} />
        {TELEGRAM.map((t) => (
          <Typewriter key={t.line} text={t.text} from={c.at(t.line, 1)} to={c.end(t.line)} size={40} style={{marginBottom: 30, lineHeight: 1.35}} />
        ))}
      </div>
      <NameTag name="JOHN HERRICK" sub="Chỉ huy biên đội tàu khu trục" at={c.at('L14', 'john')} out={c.at('L15')} y={70} />
      <Vignette strength={0.55} />
      <Sfx name="rain_loop" at={0} dur={c.total} volume={0.25} fadeIn={20} />
      <Sfx name="paper" at={paperIn} volume={0.7} />
      {TELEGRAM.map((t) => (
        <Sfx key={t.line} name="typewriter" at={c.at(t.line, 1)} volume={0.75} />
      ))}
      <Sfx name="typewriter" at={c.at('L17', 1) + 70} volume={0.7} />
      <Sfx name="typewriter_bell" at={c.end('L17')} volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C09
export const S09: React.FC = () => {
  const c = useClock();
  const cut = c.at('L19');
  const launches = [cut + 20, cut + 52, cut + 84];
  return (
    <AbsoluteFill>
      <WhipBetween
        at={cut}
        a={
          <Camera zoom={[1, 1.12]} x={50} y={55} duration={cut + 10} handheld={0.3}>
            <WhiteHouse />
          </Camera>
        }
        b={
          <Camera zoom={[1.05, 1]} x={60} y={60} duration={c.total} shakes={launches.map((l) => ({at: l, amp: 12, dur: 20}))}>
            <CarrierDeck launches={launches} />
          </Camera>
        }
      />
      <Banner text="WASHINGTON" at={c.at('L18')} out={cut - 6} y={150} size={70} />
      <DateStamp text="5/8/1964" at={cut + 8} corner="tr" />
      <Vignette strength={0.5} />
      <Sfx name="wind_loop" at={0} dur={cut} volume={0.2} fadeOut={10} />
      <Sfx name="clock_loop" at={0} dur={cut} volume={0.25} />
      <Sfx name="whoosh" at={cut - 8} volume={0.7} />
      {launches.map((l) => (
        <Sfx key={l} name="jet_flyby" at={l - 30} volume={0.75} />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C10
export const S10: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const hit = c.at('L21', 'bị');
  const shots: number[] = [];
  for (let f = 8; f < hit + 20; f += 11 + Math.floor(random(`aa${f}`) * 8)) {
    shots.push(f);
  }
  const planeK = (frame - (hit - 40)) / 70;
  const chuteY = interpolate(frame, [hit + 30, c.total], [260, 560], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bars = c.at('L22');
  const barsK = interpolate(frame, [bars, bars + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.bounce)});
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.08]} x={60} y={40} duration={c.total} shakes={shots.map((s) => ({at: s, amp: 5, dur: 6}))} handheld={0.5}>
        <Coast shots={shots}>
          <FallingPlane k={planeK} />
          {frame > hit + 30 ? <Parachute x={1250} y={chuteY} s={0.9} /> : null}
        </Coast>
      </Camera>
      {barsK > 0 ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <rect width={W} height={H} fill="#000" opacity={0.35 * barsK} />
          {new Array(11).fill(0).map((_, i) => (
            <rect key={i} x={60 + i * 180} y={-H + barsK * H} width={36} height={H} fill="#30343a" stroke={C.ink} strokeWidth={6} />
          ))}
          <rect x={0} y={-H + barsK * H + 120} width={W} height={36} fill="#30343a" stroke={C.ink} strokeWidth={6} />
          <rect x={0} y={-H + barsK * H + H - 160} width={W} height={36} fill="#30343a" stroke={C.ink} strokeWidth={6} />
        </svg>
      ) : null}
      <Banner text="5/8 · NGÀY TRUYỀN THỐNG HẢI QUÂN VIỆT NAM" at={c.at('L20', 'ngày')} out={c.at('L21') - 4} y={130} size={56} />
      <NameTag name="EVERETT ALVAREZ" sub="Phi công Mỹ, 26 tuổi" at={c.at('L21', 'everett')} out={bars - 4} x={70} y={640} />
      <Counter from={0} to={8} start={bars + 8} end={c.end('L22')} x={W / 2} y={540} size={260} color={C.mustard} prefix="" suffix=" NĂM" />
      <Vignette strength={0.45} />
      {shots.map((s, i) => (i % 2 === 0 ? <Sfx key={s} name="flak" at={s} volume={0.45} /> : null))}
      <Sfx name="plane_down" at={hit - 30} volume={0.8} />
      <Sfx name="wind_loop" at={0} dur={c.total} volume={0.25} />
      <Sfx name="hit" at={bars + 4} volume={0.85} />
      {new Array(8).fill(0).map((_, i) => (
        <Sfx key={i} name="tick" at={bars + 8 + Math.round(((c.end('L22') - bars - 8) * (1 - Math.sqrt(1 - (i + 1) / 8))))} volume={0.7} />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C11
const VoteBoard: React.FC<{title: string; yes: number; no: number; start: number; end: number; x: number}> = ({title, yes, no, start, end, x}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [start - 14, start], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (show <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 120,
        width: 640,
        height: 380,
        transform: `translateX(-50%) scale(${0.8 + 0.2 * show})`,
        opacity: show,
        background: '#1c1f24',
        border: `8px solid ${C.ink}`,
        boxShadow: `10px 12px 0 ${C.ink}`,
        borderRadius: 18,
      }}
    >
      <div style={{fontFamily: FONT.display, fontSize: 60, color: C.white, textAlign: 'center', marginTop: 18, textShadow: outline(4)}}>{title}</div>
      <div style={{position: 'absolute', left: 50, top: 120, fontFamily: FONT.body, fontWeight: 800, fontSize: 34, color: '#7fe3a0'}}>THUẬN</div>
      <div style={{position: 'absolute', right: 50, top: 120, fontFamily: FONT.body, fontWeight: 800, fontSize: 34, color: '#ff8c7a'}}>CHỐNG</div>
      <Counter from={0} to={yes} start={start} end={end} x={170} y={260} size={150} color="#7fe3a0" />
      <Counter from={0} to={no} start={start} end={end} x={470} y={260} size={150} color="#ff8c7a" />
    </div>
  );
};

export const S11: React.FC = () => {
  const c = useClock();
  const house = [c.at('L24', 0), c.end('L24')] as const;
  const senate = [c.at('L25', 0), c.end('L25')] as const;
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.06]} x={50} y={70} duration={c.total} handheld={0.3}>
        <Congress />
      </Camera>
      <Banner text="NGHỊ QUYẾT VỊNH BẮC BỘ · 7/8/1964" at={c.at('L23', 2)} out={house[0] - 16} y={140} size={60} />
      <VoteBoard title="HẠ VIỆN" yes={416} no={0} start={house[0]} end={house[1]} x={560} />
      <VoteBoard title="THƯỢNG VIỆN" yes={88} no={2} start={senate[0]} end={senate[1]} x={1360} />
      <Vignette strength={0.5} />
      <Sfx name="crowd_murmur_loop" at={0} dur={c.total} volume={0.35} fadeIn={15} fadeOut={20} />
      <Sfx name="gavel" at={c.at('L23') + 4} volume={0.8} />
      {[house, senate].map(([s, e], j) =>
        new Array(14).fill(0).map((_, i) => <Sfx key={`${j}-${i}`} name="tick" at={s + Math.round(((e - s) * i) / 14)} volume={0.45} />),
      )}
      <Sfx name="hit" at={house[1]} volume={0.6} />
      <Sfx name="gavel" at={senate[1] + 2} volume={0.85} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C12
const Pen: React.FC = () => <path d="M -4 0 L 40 -70 L 50 -64 L 6 6 Z" fill="#333" stroke={C.ink} strokeWidth={3} />;

export const S12: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const quote = c.at('L27', 'chúng');
  const writing = frame < quote;
  const scribble = writing ? Math.sin(frame * 0.9) * 4 + Math.sin(frame * 0.37) * 3 : 0;
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.05]} x={50} y={45} duration={c.total} snaps={[{at: quote, to: 1.25, x: 48, y: 30}]} handheld={0.3}>
        <Study
          front={
            <g>
              <DeskLamp x={1530} y={410} flip />
              <g transform="translate(620 830) rotate(-8)">
                <rect x={-150} y={-40} width={300} height={70} rx={6} fill="#d8cdb4" stroke={C.ink} strokeWidth={6} />
                <text x={0} y={10} textAnchor="middle" fontFamily="Anton" fontSize={36} fill={C.ink}>
                  HỒI KÝ · 1995
                </text>
              </g>
              <path d="M 860 820 L 1120 806 L 1132 900 L 872 914 Z" fill="#fffdf6" stroke={C.ink} strokeWidth={5} />
            </g>
          }
        >
          <Character
            x={960}
            y={900}
            scale={1.45}
            outfit="suit"
            hair="old"
            glasses
            expr={writing ? 'focused' : 'sad'}
            look={writing ? [0.3, 1] : [0, 0]}
            armL={{a: 30, bend: -0.2}}
            armR={{a: 40 + scribble, bend: -0.25, len: 96}}
            handR={<Pen />}
            seed={41}
          />
        </Study>
      </Camera>
      <NameTag name="ROBERT McNAMARA" sub="Bộ trưởng Quốc phòng Mỹ 1961–1968" at={c.at('L26', 'robert')} out={quote - 6} />
      <DateStamp text="1995" at={c.at('L26')} corner="tr" />
      <PunchText text={'“Chúng tôi đã sai.\nSai khủng khiếp.”'} at={quote} x={W / 2} y={860} size={96} color={C.white} rotate={-1} font={FONT.body} stroke={7} />
      <Vignette strength={0.35} />
      <Sfx name="clock_loop" at={0} dur={c.total} volume={0.35} fadeIn={20} />
      <Sfx name="pen_scratch" at={10} volume={0.5} />
      <Sfx name="pen_scratch" at={100} volume={0.5} />
      <Sfx name="hit" at={quote} volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C13
/** Người ngồi ngược sáng: chỉ thấy bóng, không vẽ nét mặt. */
const Silhouette: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + 0.01 * Math.sin(frame / 18);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(1 ${breathe})`}>
        <path d="M -60 -162 C -76 -120 -80 -62 -68 -36 C -58 -18 58 -18 68 -36 C 80 -62 76 -120 60 -162 C 40 -184 -40 -184 -60 -162 Z" fill="#2a2620" stroke="#fff3c4" strokeWidth={4} />
      </g>
      <circle cx={0} cy={-232} r={64} fill="#2a2620" stroke="#fff3c4" strokeWidth={4} />
    </g>
  );
};

export const S13: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const ask = [c.at('L29', 2), c.end('L29')];
  const answer = c.at('L30', 'không');
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.04]} x={35} y={45} duration={c.total} snaps={[{at: c.at('L30'), to: 1.3, x: 30, y: 38}]} handheld={0.3}>
        <HanoiRoom
          front={
            <g>
              <path d="M 640 860 L 1280 860 L 1240 900 L 680 900 Z" fill={C.woodDark} stroke={C.ink} strokeWidth={6} />
              <path d="M 700 900 L 700 1020 M 1220 900 L 1220 1020" stroke={C.ink} strokeWidth={14} />
              <Teacup x={860} y={856} s={0.9} />
              <Teacup x={1060} y={856} s={0.9} />
            </g>
          }
        >
          <CeilingFan x={760} y={110} />
          <Character
            x={520}
            y={1000}
            scale={1.35}
            outfit="suit"
            hair="old"
            glasses
            expr={frame < answer ? 'focused' : frame < answer + 30 ? 'blank' : 'sad'}
            talk={frame >= ask[0] && frame <= ask[1]}
            look={[1, 0]}
            lean={frame >= ask[0] && frame <= ask[1] ? 3 : 0}
            armL={{a: 20}}
            armR={{a: 60, bend: 0.4}}
            seed={51}
          />
          <Silhouette x={1430} y={1000} s={1.35} />
        </HanoiRoom>
      </Camera>
      <DateStamp text="HÀ NỘI · 11/1995" at={c.at('L28', 'hà')} out={c.at('L30') - 4} corner="tr" />
      <PunchText text="KHÔNG CÓ GÌ CẢ." at={answer} x={W / 2} y={190} size={110} color={C.white} rotate={0} />
      <Vignette strength={0.4} />
      <Sfx name="ceiling_fan_loop" at={0} dur={c.total} volume={0.4} fadeIn={15} />
      <Sfx name="teacup" at={c.at('L28') + 10} volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C14
export const S14: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const words = [c.at('L31', 0), c.at('L31', 3), c.at('L31', 6)];
  const blips: Blip[] = [
    {theta: 50, r0: 250, r1: 230},
    {theta: 63, r0: 215, r1: 200},
    {theta: 44, r0: 300, r1: 280, size: 0.8},
  ];
  const drawerAt = c.at('L32');
  const open = interpolate(frame, [drawerAt + 6, drawerAt + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const docOut = interpolate(frame, [c.at('L32', 'nằm'), c.at('L32', 'nằm') + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const stampAt = c.at('L33', 'cớ');
  const endAt = c.at('L34');
  const year = c.at('L34', '1945');
  const black = interpolate(frame, [endAt - 4, endAt + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{clipPath: `circle(${interpolate(frame, [drawerAt - 10, drawerAt + 8], [150, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}% at 50% 50%)`}}>
        <Camera zoom={[1.2, 1.32]} x={56} y={44} duration={drawerAt}>
          <Radar blips={blips} fadeAt={words} period={3.4} />
        </Camera>
      </AbsoluteFill>
      {frame >= drawerAt - 10 ? (
        <AbsoluteFill style={{clipPath: `circle(${interpolate(frame, [drawerAt - 4, drawerAt + 18], [0, 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}% at 50% 50%)`}}>
          <Camera zoom={[1, 1.1]} x={50} y={45} duration={c.total - drawerAt} shakes={[{at: stampAt, amp: 18, dur: 12}]}>
            <DrawerDoc open={open} docOut={docOut} stampAt={stampAt} />
          </Camera>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: '#000', opacity: black}} />
      <PunchText text="1945" at={year} x={W / 2} y={H / 2} size={300} color={C.mustard} rotate={-3} stroke={10} />
      <Grain opacity={0.1} />
      {words.map((w, i) => (
        <Sfx key={i} name="radar_beep" at={w} volume={0.45 - i * 0.1} rate={1 - i * 0.08} />
      ))}
      <Sfx name="whoosh_short" at={drawerAt - 6} volume={0.5} />
      <Sfx name="paper" at={drawerAt + 8} volume={0.6} />
      <Sfx name="paper" at={c.at('L32', 'nằm')} volume={0.7} />
      <Sfx name="hit" at={stampAt} volume={0.95} />
      <Sfx name="rewind" at={endAt} volume={0.5} />
      <Sfx name="hit" at={year} volume={0.8} />
    </AbsoluteFill>
  );
};
