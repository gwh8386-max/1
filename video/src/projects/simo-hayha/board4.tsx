import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Rifle} from '../../art/Winter';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Aged, Cutout, Fit169, Polaroid, Sticky, TypedTag} from '../../vox/paper';
import {BOARDS, c, em} from './clock';
import {Breath, ForestHunt, HeadHeight, PhoneGag, SnowCross, SunMoon, TornCoat} from './diagrams';
import {HoodPortrait, Panel, S} from './kit';
import {GlintPanel} from './panels';

// BẢNG 4 (L30–L47): không ống ngắm, các mẹo, đại uý Juutilainen, Hồng quân đi săn.
const WW = 3840;
const WH = 2400;

const T = {
  l30: c.at('L30'),
  helped: c.at('L30', 'scope'),
  him: em('L30'),
  l31: c.at('L31'),
  flash: c.at('L31', 'flash'),
  frost: c.at('L31', 'frost'),
  l32: c.at('L32'),
  inches: c.at('L32', 'inches'),
  lot: c.at('L32', 'lot'),
  l33: c.at('L33'),
  other: c.at('L33', 'other'),
  l34: c.at('L34'),
  mosin: c.at('L34', 'mosin'),
  red: c.at('L34', 'red'),
  l35: c.at('L35'),
  tricks: c.at('L35', 'tricks'),
  l36: c.at('L36'),
  packed: c.at('L36', 'packed'),
  hard: c.at('L36', 'hard'),
  muzzle: c.at('L36', 'muzzle'),
  l37: c.at('L37'),
  steam: c.at('L37', 'steam'),
  l38: c.at('L38'),
  still: c.at('L38', 'still'),
  l38end: c.end('L38'),
  l39: c.at('L39'),
  phones: c.at('L39', 'phones'),
  l40: c.at('L40'),
  captain: c.at('L40', 'captain'),
  morocco: c.at('L40', 'morocco'),
  l41: c.at('L41'),
  sending: c.at('L41', 'sending'),
  men: c.at('L41', 'men'),
  l42: c.at('L42'),
  worked: c.at('L42', 'worked'),
  l43: c.at('L43'),
  counter: c.at('L43', 'counter'),
  him43: em('L43'),
  l44: c.at('L44'),
  back: c.at('L44', 'back'),
  l45: c.at('L45'),
  artillery: c.at('L45', 'artillery'),
  might: c.at('L45', 'might'),
  l46: c.at('L46'),
  coat: c.at('L46', 'coat'),
  l47: c.at('L47'),
  work: c.at('L47', 'work'),
  l47end: c.end('L47'),
};

const SCOPE = {x: 200, y: 200, w: 1100, h: 520};
const HEADS = {x: 200, y: 800, w: 1100, h: 560};
const GLINT = {x: 1420, y: 200, w: 900, h: 506};
const MOSIN = {x: 1420, y: 800, w: 1100, h: 360};
const CROSS = {x: 200, y: 1440, w: 1200, h: 700};
const BREATH = {x: 1500, y: 1280, w: 700, h: 460};
const SUN = {x: 1500, y: 1820, w: 760, h: 460};
const PHONE = {x: 2330, y: 1800, w: 420, h: 500};
const POLA = {x: 2680, y: 180, w: 540, h: 640};
const HUNT = {x: 2660, y: 1000, w: 1100, h: 760};
const COAT = {x: 2900, y: 1840, w: 500, h: 480};
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: BOARDS.b4[0], x: ctr(SCOPE)[0], y: ctr(SCOPE)[1], z: 1.25},
  {at: T.l32 + 2, dur: 14, x: ctr(HEADS)[0], y: ctr(HEADS)[1], z: 1.3},
  {at: T.l33 + 2, dur: 14, x: ctr(GLINT)[0], y: ctr(GLINT)[1], z: 1.5},
  {at: T.l34 + 2, dur: 14, x: ctr(MOSIN)[0], y: ctr(MOSIN)[1] + 40, z: 1.35},
  {at: T.l35 + 2, dur: 16, x: ctr(CROSS)[0], y: ctr(CROSS)[1], z: 1.2},
  {at: T.l37 + 2, dur: 14, x: ctr(BREATH)[0], y: ctr(BREATH)[1], z: 1.55},
  {at: T.l38 + 2, dur: 14, x: ctr(SUN)[0], y: ctr(SUN)[1], z: 1.5},
  {at: T.l39 + 2, dur: 14, x: ctr(PHONE)[0] - 60, y: ctr(PHONE)[1], z: 1.45},
  {at: T.l40 + 4, dur: 18, x: ctr(POLA)[0] + 120, y: ctr(POLA)[1] + 60, z: 1.3},
  {at: T.l42 + 2, dur: 16, x: 2700, y: 700, z: 0.95},
  {at: T.l43 + 4, dur: 16, x: ctr(HUNT)[0], y: ctr(HUNT)[1], z: 1.25},
  {at: T.coat - 6, dur: 14, x: ctr(COAT)[0], y: ctr(COAT)[1] - 40, z: 1.4},
  {at: T.l47end + 30, dur: 40, ease: 'smooth', x: WW / 2, y: WH / 2, z: 0.5},
];

const SHAKES: WorldShake[] = [
  {at: T.red, amp: 12, dur: 10},
  {at: T.might, amp: 24, dur: 26},
  {at: T.might + 18, amp: 18, dur: 16},
  {at: T.coat, amp: 12, dur: 10},
];

/** Mũi tên mắt vẽ tay: kẻ thù nhìn thấy (L30). */
const Eye: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const frame = useCurrentFrame();
  if (frame < at) {
    return null;
  }
  const k = interpolate(frame, [at, at + 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <svg width={260} height={160} style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `scale(${k})`}}>
      <path d="M 10 80 Q 130 -10 250 80 Q 130 170 10 80 Z" fill="#fff" stroke="#d42a1c" strokeWidth={10} />
      <circle cx={130} cy={80} r={34} fill="#d42a1c" />
      <circle cx={140} cy={70} r={10} fill="#fff" />
    </svg>
  );
};

export const Board4: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <Sticky x={3360} y={860} text={'Kollaa\nwinter 1940'} rot={6} size={46} />
    <Sticky x={60} y={2160} text={'hours.\nnot minutes.'} rot={-5} size={44} at={T.still} />

    {/* TRẠM 1: ống ngắm loé sáng, đóng sương */}
    <Cutout {...SCOPE} rot={-1.5} seed="b4scope" texture="white" pin>
      <svg width={SCOPE.w} height={SCOPE.h} style={{position: 'absolute', inset: 0}}>
        <GlintRifle w={SCOPE.w} h={SCOPE.h} flash={T.flash} frost={T.frost} />
      </svg>
      <div style={{position: 'absolute', left: 40, top: 30, fontFamily: '"Special Elite"', fontSize: 40}}>SNIPER SCOPE</div>
    </Cutout>
    <Eye at={T.him} x={1040} y={560} />
    <HandLabel x={300} y={720} text="glare · fog · frost" at={T.frost} size={50} rot={-2} />

    {/* TRẠM 2: ngóc đầu cao hơn */}
    <Cutout {...HEADS} rot={1.5} seed="b4heads" texture="white" pin at={T.l32 - 6}>
      <HeadHeight w={HEADS.w} h={HEADS.h} at={T.lot} />
    </Cutout>

    {/* TRẠM 3: ống ngắm bên kia loé */}
    <Panel {...GLINT} rot={2} seed="b4glint" at={T.l33 - 8}>
      <GlintPanel at={T.l33 + 10} />
    </Panel>
    <Marks width={WW} height={WH} items={[{kind: 'circle', cx: GLINT.x + (1180 / 1920) * GLINT.w, cy: GLINT.y + (600 / 1080) * GLINT.h, rx: 90, ry: 70, at: T.other, dur: 10, seed: 'gl'}]} />
    <HandLabel x={1500} y={720} text="the other side's scope" at={T.other + 4} size={44} rot={-3} />

    {/* TRẠM 4: Mosin-Nagant */}
    <Cutout {...MOSIN} rot={-2} seed="b4mosin" texture="kraft" pin at={T.l34 - 6}>
      <svg width={MOSIN.w} height={MOSIN.h} style={{position: 'absolute', inset: 0}}>
        <Rifle x={50} y={MOSIN.h * 0.62} s={(MOSIN.w - 100) / 770} />
      </svg>
      <div style={{position: 'absolute', left: 40, top: 20, fontFamily: '"Special Elite"', fontSize: 38}}>M/28-30 · FINNISH-MADE MOSIN-NAGANT</div>
      <Stamp x={MOSIN.w * 0.72} y={MOSIN.h * 0.36} text="RUSSIAN DESIGN" sub="RETURN TO SENDER" at={T.red} rot={-10} size={54} />
    </Cutout>

    {/* TRẠM 5: mẹo */}
    <Cutout {...CROSS} rot={-1} seed="b4cross" texture="white" pin at={T.l35 - 6}>
      <SnowCross w={CROSS.w} h={CROSS.h} packAt={T.packed} iceAt={T.hard} />
    </Cutout>
    <TypedTag x={240} y={1340} text="TRICK NO. 1" at={T.tricks} rot={-4} w={480} size={44} />
    <Cutout {...BREATH} rot={2} seed="b4breath" texture="white" pin at={T.l37 - 6}>
      <Breath w={BREATH.w} h={BREATH.h} crossAt={T.steam} />
    </Cutout>
    <Cutout {...SUN} rot={-2} seed="b4sun" texture="none" tear={false} pin at={T.l38 - 6}>
      <SunMoon w={SUN.w} h={SUN.h} at={T.still} dur={T.l38end - T.still} />
    </Cutout>
    <Cutout {...PHONE} rot={4} seed="b4phone" texture="sticky" tear={false} at={T.l39 - 6}>
      <PhoneGag w={PHONE.w} h={PHONE.h} crossAt={T.phones} />
    </Cutout>

    {/* TRẠM 6: đại uý Juutilainen */}
    <Polaroid {...POLA} rot={4} at={T.l40 - 4} enter="right" caption="Capt. Aarne Juutilainen">
      <Aged gray={1} sepia={0.25} dots={0.18}>
        <Fit169 w={POLA.w - 48} h={POLA.h - 134}>
          <HoodPortrait expr="smirk" outfit="officer" hat="kepi" />
        </Fit169>
      </Aged>
    </Polaroid>
    <Stamp x={3440} y={420} text="TERROR OF" sub="MOROCCO" at={T.morocco} rot={-12} size={70} />
    <TypedTag x={3260} y={560} text="EX-FOREIGN LEGION" at={T.captain + 10} rot={6} w={560} size={40} />
    <Cutout x={2300} y={780} w={460} h={200} rot={-6} seed="b4order" texture="paper" at={T.sending} enter="right">
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Special Elite"', fontSize: 36, textAlign: 'center', padding: 20}}>ORDER: FIND THEIR SNIPERS</div>
    </Cutout>
    <HandLabel x={2340} y={980} text="quiet farmer + loud legionnaire" at={T.l42} size={44} rot={-3} />
    <Marks width={WW} height={WH} items={[{kind: 'arrow', from: [2700, 900], to: [2780, 800], bend: 0, at: T.worked, dur: 4, width: 14}]} />
    <PunchTick at={T.worked} x={2560} y={760} />

    {/* TRẠM 7: săn người săn */}
    <Cutout {...HUNT} rot={1} seed="b4hunt" texture="white" pin at={T.l43 - 6}>
      <ForestHunt w={HUNT.w} h={HUNT.h} enter={T.counter} findAt={T.him43} goneAt={T.back} shellAt={T.might} />
    </Cutout>
    <TypedTag x={2700} y={900} text="COUNTER-SNIPERS" at={T.counter} rot={-3} w={600} size={44} color="#b4231b" />
    <Cutout {...COAT} rot={-3} seed="b4coat" texture="kraft" pin at={T.l46 - 6}>
      <TornCoat w={COAT.w} h={COAT.h} tearAt={T.coat} />
    </Cutout>
    <Stamp x={3600} y={2200} text="BACK TO WORK" at={T.work} rot={-8} size={60} />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [800, 700], b: [800, 820], from: T.l32 - 10, to: T.l32, sag: 0.02},
        {a: [1250, 900], b: [1800, 230], from: T.l33 - 14, to: T.l33},
        {a: [1900, 700], b: [1960, 830], from: T.l34 - 10, to: T.l34, sag: 0.02},
        {a: [1600, 1140], b: [800, 1460], from: T.l35 - 14, to: T.l35},
        {a: [1350, 1500], b: [1850, 1300], from: T.l37 - 12, to: T.l37},
        {a: [1850, 1720], b: [1880, 1840], from: T.l38 - 10, to: T.l38, sag: 0.02},
        {a: [2200, 1950], b: [2540, 1820], from: T.l39 - 10, to: T.l39},
        {a: [2500, 1820], b: [2950, 200], from: T.l40 - 16, to: T.l40},
        {a: [2950, 820], b: [3200, 1020], from: T.l43 - 12, to: T.l43},
        {a: [3200, 1750], b: [3150, 1860], from: T.l46 - 10, to: T.l46, sag: 0.02},
      ]}
    />
  </WorldView>
);

const GlintRifle: React.FC<{w: number; h: number; flash: number; frost: number}> = ({w, h, flash, frost}) => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [flash, flash + 4, flash + 16], [0, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const f = interpolate(frame, [frost, frost + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <Rifle x={40} y={h * 0.66} s={(w - 80) / 770} scope glint={g} frost={f} />;
};

const PunchTick: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const frame = useCurrentFrame();
  if (frame < at) {
    return null;
  }
  const k = interpolate(frame, [at, at + 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <svg width={200} height={200} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
      <path d="M 20 110 L 80 170 L 190 30" fill="none" stroke="#d42a1c" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 1`} />
    </svg>
  );
};

export const Board4Sfx: React.FC = () => (
  <>
    <S name="pop" at={T.him} volume={0.6} />
    <S name="flash" at={T.flash} volume={0.6} />
    <S name="scribble" at={T.frost} volume={0.4} />
    <S name="whoosh" at={T.l32 - 12} volume={0.4} />
    <S name="marker_draw" at={T.lot} volume={0.5} />
    <S name="whoosh" at={T.l33 - 12} volume={0.4} />
    <S name="flash" at={T.l33 + 10} volume={0.4} />
    <S name="marker_draw" at={T.other} volume={0.5} />
    <S name="whoosh" at={T.l34 - 12} volume={0.4} />
    <S name="stamp" at={T.red} volume={0.9} />
    <S name="whoosh" at={T.l35 - 12} volume={0.4} />
    <S name="snow_step" at={T.packed} volume={0.6} />
    <S name="rain_loop" at={T.hard - 16} dur={24} volume={0.35} fadeIn={4} fadeOut={8} />
    <S name="flash" at={T.hard} volume={0.35} />
    <S name="whoosh" at={T.l37 - 12} volume={0.4} />
    <S name="scribble" at={T.steam} volume={0.55} />
    <S name="clock_loop" at={T.still} dur={T.l38end - T.still} volume={0.4} fadeOut={8} />
    <S name="pop" at={T.l39} volume={0.5} />
    <S name="scribble" at={T.phones} volume={0.5} />
    <S name="whoosh" at={T.l40 - 10} volume={0.5} />
    <S name="shutter" at={T.l40 - 2} volume={0.7} />
    <S name="stamp" at={T.morocco} volume={0.9} />
    <S name="paper" at={T.sending} volume={0.6} />
    <S name="marker_draw" at={T.worked} volume={0.6} />
    <S name="whoosh" at={T.l43 - 10} volume={0.45} />
    <S name="snow_step" at={T.counter} volume={0.45} />
    <S name="snow_step" at={T.counter + 20} volume={0.4} rate={1.05} />
    {[0, 7, 14, 21, 28].map((d) => (
      <S key={d} name="rifle_shot" at={T.back + d} volume={0.35} rate={0.95 + d / 200} />
    ))}
    {new Array(6).fill(0).map((_, i) => (
      <S key={`a${i}`} name={i % 2 ? 'explosion_far' : 'cannon'} at={T.might + i * 6} volume={0.6} rate={0.9 + 0.04 * i} />
    ))}
    <S name="paper" at={T.coat} volume={0.7} />
    <S name="stamp" at={T.work} volume={0.8} />
  </>
);
