import React from 'react';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {HandLabel, Marks, Strings} from '../../vox/marks';
import {Cutout, Sticky, TypedTag} from '../../vox/paper';
import {DaylightClock, Thermometer} from '../../art/Winter';
import {BOARDS, c} from './clock';
import {MottiMap, SnowDepth, Woodpile} from './diagrams';
import {Panel, S} from './kit';
import {PovPanel} from './panels';

// BẢNG 3 (L22–L29): đường và rừng, motti; phía bên kia khoảng rừng.
const WW = 3840;
const WH = 2400;

const T = {
  l22: c.at('L22'),
  tanks: c.at('L22', 'tanks'),
  roads: c.at('L22', 'roads'),
  l23: c.at('L23'),
  crawl: c.at('L23', 'crawl'),
  waist: c.at('L23', 'waist'),
  l24: c.at('L24'),
  skis: c.at('L24', 'skis'),
  cut: c.at('L24', 'cut'),
  freeze: c.at('L24', 'freeze'),
  l25: c.at('L25'),
  motti: c.at('L25', 'motti'),
  firewood: c.at('L25', 'firewood'),
  l26: c.at('L26'),
  other: c.at('L26', 'other'),
  l27: c.at('L27'),
  conscript: c.at('L27', 'conscript'),
  below: c.at('L27', 'below'),
  l28: c.at('L28'),
  six: c.at('L28', 'six'),
  drops: c.at('L28', 'drops'),
  l29: c.at('L29'),
  from: c.at('L29', 'from'),
  l29end: c.end('L29'),
};

const MOTTI = {x: 200, y: 200, w: 1800, h: 1000};
const DEPTH = {x: 2150, y: 230, w: 520, h: 720};
const WOOD = {x: 2150, y: 1020, w: 640, h: 400};
const POV = {x: 300, y: 1320, w: 1800, h: 1013};
const THERMO = {x: 2240, y: 1460, w: 380, h: 860};
const CLOCK = {x: 2760, y: 1460, w: 560, h: 560};
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: BOARDS.b3[0], x: ctr(MOTTI)[0], y: ctr(MOTTI)[1], z: 1.0},
  {at: T.roads, dur: 14, x: 900, y: 700, z: 1.4},
  {at: T.waist - 2, dur: 14, x: ctr(DEPTH)[0], y: ctr(DEPTH)[1], z: 1.35},
  {at: T.l24 + 2, dur: 14, x: ctr(MOTTI)[0] + 100, y: ctr(MOTTI)[1], z: 1.08},
  {at: T.motti - 4, dur: 14, x: 1800, y: 1050, z: 1.1},
  {at: T.l26 + 2, dur: 18, x: ctr(POV)[0], y: ctr(POV)[1], z: 1.03},
  {at: T.below - 4, dur: 14, x: ctr(THERMO)[0] + 120, y: ctr(THERMO)[1], z: 1.2},
  {at: T.six - 4, dur: 14, x: ctr(CLOCK)[0] - 100, y: ctr(CLOCK)[1] + 80, z: 1.25},
  {at: T.drops - 10, dur: 12, x: ctr(POV)[0] + 120, y: ctr(POV)[1] + 40, z: 1.15},
  {at: T.l29end + 10, dur: 50, ease: 'smooth', x: ctr(POV)[0] - 100, y: ctr(POV)[1] + 40, z: 1.4},
];

const SHAKES: WorldShake[] = [
  {at: T.cut, amp: 10, dur: 10},
  {at: T.drops, amp: 16, dur: 12},
];

export const Board3: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <Sticky x={3300} y={260} text={'tanks, artillery,\nplanes...'} rot={6} size={40} />
    <Sticky x={3400} y={2060} text={'summer\nuniforms?'} rot={-6} size={46} at={T.conscript} />
    <Sticky x={2900} y={700} text={'ski troops'} rot={-4} size={52} at={T.skis} />

    {/* TRẠM 1: motti */}
    <Cutout {...MOTTI} rot={-1} seed="b3motti" pin tape>
      <MottiMap w={MOTTI.w} h={MOTTI.h} crawl={T.l22} cutAt={T.cut} freezeAt={T.freeze} mottiAt={T.motti} />
      <Marks width={MOTTI.w} height={MOTTI.h} items={[{kind: 'circle', cx: 700, cy: 470, rx: 520, ry: 120, at: T.roads, dur: 14, seed: 'rd', width: 10}]} />
    </Cutout>
    <HandLabel x={300} y={1210} text="one road. miles of column." at={T.roads + 6} size={52} rot={-2} />
    <Cutout {...DEPTH} rot={2.5} seed="b3depth" texture="white" pin at={T.l23 - 4}>
      <SnowDepth w={DEPTH.w} h={DEPTH.h} at={T.waist} />
    </Cutout>
    <Cutout {...WOOD} rot={-3} seed="b3wood" texture="kraft" pin at={T.motti - 2}>
      <Woodpile w={WOOD.w} h={WOOD.h} />
    </Cutout>
    <Sticky x={2830} y={1100} text={'motti =\nstack of\nfirewood'} rot={5} size={44} at={T.firewood} />

    {/* TRẠM 2: phía bên kia */}
    <Panel {...POV} rot={1} seed="b3pov" at={T.l26 - 10}>
      <PovPanel dropAt={T.drops} turnAt={T.l29} />
    </Panel>
    <TypedTag x={420} y={1220} text="THE OTHER SIDE" at={T.other} rot={-4} w={640} size={52} color="#b4231b" />
    <Cutout {...THERMO} rot={-2} seed="b3thermo" texture="white" pin at={T.l27}>
      <Thermometer w={THERMO.w} h={THERMO.h} at={T.l27 + 6} dur={T.below - T.l27} />
    </Cutout>
    <Cutout {...CLOCK} rot={3} seed="b3clock" texture="white" pin at={T.l28 - 4}>
      <DaylightClock size={CLOCK.w} at={T.l28} />
    </Cutout>
    <HandLabel x={2700} y={2060} text="daylight" at={T.six} size={52} rot={-3} />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [1900, 400], b: [2400, 260], from: T.l23 - 14, to: T.l23},
        {a: [1700, 1150], b: [2450, 1040], from: T.motti - 14, to: T.motti},
        {a: [2400, 1300], b: [1200, 1340], from: T.l26 - 16, to: T.l26},
        {a: [2050, 1700], b: [2430, 1480], from: T.l27 - 10, to: T.l27, sag: 0.02},
        {a: [2600, 1600], b: [3040, 1480], from: T.l28 - 10, to: T.l28, sag: 0.02},
      ]}
    />
  </WorldView>
);

export const Board3Sfx: React.FC = () => (
  <>
    <S name="boat_engine" at={T.l22} dur={T.cut - T.l22} volume={0.35} rate={0.7} fadeIn={10} fadeOut={10} />
    <S name="marker_draw" at={T.roads} volume={0.5} />
    <S name="whoosh" at={T.waist - 14} volume={0.4} />
    <S name="snow_step" at={T.waist} volume={0.5} />
    <S name="whoosh" at={T.l24 - 10} volume={0.4} />
    {[0, 8, 16].map((d) => (
      <S key={d} name="ski_swish" at={T.skis + d} volume={0.6} rate={1 + d / 60} />
    ))}
    <S name="hit" at={T.cut + 24} volume={0.5} />
    <S name="flash" at={T.freeze} volume={0.4} />
    <S name="scribble" at={T.motti} volume={0.5} />
    <S name="paper" at={T.firewood} volume={0.5} />
    <S name="whoosh" at={T.l26 - 12} volume={0.55} />
    <S name="wind_loop" at={T.l26} dur={T.l29end + 40 - T.l26} volume={0.45} fadeIn={30} fadeOut={20} />
    <S name="tick" at={T.below} volume={0.5} />
    <S name="clock_loop" at={T.l28} dur={T.drops - T.l28} volume={0.3} fadeOut={6} />
    <S name="rifle_shot" at={T.drops - 2} volume={0.8} />
    <S name="heartbeat" at={T.l29} volume={0.7} />
    <S name="heartbeat" at={T.l29 + 40} volume={0.5} />
  </>
);
