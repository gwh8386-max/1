import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {FinlandMap, finProj, PLACES} from '../../art/FinlandMap';
import {LL, MapArrow} from '../../art/Map';
import {C} from '../../lib/theme';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Aged, Cutout, Sticky, TypedTag} from '../../vox/paper';
import {BOARDS, c} from './clock';
import {HeightRuler, PopulationChart, Target} from './diagrams';
import {FinFlag, Panel, S} from './kit';
import {FarmPanel} from './panels';

// BẢNG 2 (L11–L21): người nông dân, cuộc xâm lược, Kollaa.
const WW = 3840;
const WH = 2400;

const T = {
  l11: c.at('L11'),
  rautjarvi: c.at('L11', 'rautj'),
  border: c.at('L11', 'border'),
  l12: c.at('L12'),
  five: c.at('L12', 'five'),
  much: c.at('L12', 'much'),
  l13: c.at('L13'),
  guard: c.at('L13', 'civil'),
  shooting: c.at('L13', 'shooting'),
  l14: c.at('L14'),
  y1939: c.at('L14', '1939'),
  l14end: c.end('L14'),
  l15: c.at('L15'),
  invades: c.at('L15', 'invades'),
  l16: c.at('L16'),
  helsinki: c.at('L16', 'helsinki'),
  l17: c.at('L17'),
  finpop: c.at('L17', 'finland'),
  seventy: c.at('L17', 'hundred'),
  l18: c.at('L18'),
  story: c.at('L18', 'story'),
  sweden: c.at('L18', 'sweden'),
  l19: c.at('L19'),
  kollaa: c.at('L19', 'kollaa'),
  ladoga: c.at('L19', 'ladoga'),
  l20: c.at('L20'),
  road: c.at('L20', 'road'),
  l21: c.at('L21'),
  holds: c.at('L21', 'holds'),
  end: BOARDS.b2[1],
};

const FARM = {x: 200, y: 180, w: 1400, h: 788};
const MINI = {x: 1700, y: 140, w: 560, h: 640};
const RULER = {x: 1660, y: 900, w: 420, h: 700};
const TARGET = {x: 2340, y: 260, w: 640, h: 640};
const MAP = {x: 300, y: 1060, w: 1100, h: 1240};
const POP = {x: 2300, y: 1180, w: 900, h: 900};

const PM = finProj(MAP.w, MAP.h);
const onMap = (ll: LL) => {
  const [x, y] = PM(...ll);
  return [MAP.x + x, MAP.y + y];
};
const KOL = onMap(PLACES.kollaa);
const HEL = onMap(PLACES.helsinki);
const SWE = onMap(PLACES.sweden);
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const RED = '#c8281e';
const ARROWS: MapArrow[] = [
  {pts: [[30.8, 59.75], [30.0, 60.35], [29.2, 60.75]], from: T.invades - 4, to: T.invades + 14, color: RED, width: 12},
  {pts: [[34.4, 61.8], [33.2, 62.0], [32.4, 62.05]], from: T.invades, to: T.invades + 16, color: RED, width: 12},
  {pts: [[32.0, 65.0], [30.4, 64.9], [29.2, 64.9]], from: T.invades + 4, to: T.invades + 20, color: RED, width: 12},
  {pts: [[31.6, 66.9], [30.2, 66.8], [29.0, 66.8]], from: T.invades + 8, to: T.invades + 24, color: RED, width: 12},
  {pts: [[33.6, 69.3], [32.2, 69.5]], from: T.invades + 10, to: T.invades + 22, color: RED, width: 12},
];

const KEYS: CamKey[] = [
  {at: BOARDS.b2[0], x: ctr(FARM)[0], y: ctr(FARM)[1], z: 1.2},
  {at: T.border - 2, dur: 14, x: ctr(MINI)[0], y: ctr(MINI)[1] + 40, z: 1.4},
  {at: T.l12 + 2, dur: 14, x: 1560, y: ctr(RULER)[1], z: 1.15},
  {at: T.l13 + 4, dur: 16, x: ctr(TARGET)[0], y: ctr(TARGET)[1] + 60, z: 1.35},
  {at: T.y1939 - 4, dur: 12, x: 2700, y: 1000, z: 1.3},
  {at: T.l15 + 2, dur: 18, x: ctr(MAP)[0] + 60, y: ctr(MAP)[1], z: 0.95},
  {at: T.helsinki, dur: 12, x: HEL[0] + 120, y: HEL[1] - 120, z: 1.5},
  {at: T.l17 + 4, dur: 16, x: ctr(POP)[0], y: ctr(POP)[1] - 40, z: 1.05},
  {at: T.l18 + 4, dur: 18, x: SWE[0] + 120, y: SWE[1], z: 1.25},
  {at: T.l19 + 6, dur: 20, ease: 'smooth', x: KOL[0] - 200, y: KOL[1] + 60, z: 1.6},
  {at: T.l21 + 2, dur: 18, ease: 'smooth', x: KOL[0] - 120, y: KOL[1] + 120, z: 1.25},
];

const SHAKES: WorldShake[] = [
  {at: T.invades, amp: 18, dur: 14},
  {at: T.helsinki + 8, amp: 22, dur: 16},
  {at: T.seventy + 10, amp: 14, dur: 12},
  {at: T.holds, amp: 20, dur: 14},
];

/** Máy bay ném bom cắt dán bay ngang qua bản đồ về phía Helsinki (toạ độ thế giới). */
const Bombers: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 20) {
    return null;
  }
  const p = interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={WW} height={WH} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {[0, 1, 2].map((i) => {
        const x = HEL[0] + 900 - p * 1000 + i * 90;
        const y = HEL[1] - 280 + p * 220 + i * 70;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(-12) scale(0.9)`}>
            <path d="M -70 0 L 60 -6 Q 80 0 60 6 L -70 6 Z" fill="#5d5a4a" stroke={C.ink} strokeWidth={4} />
            <path d="M -10 -4 L -40 -60 L -20 -60 L 20 -4 Z M -10 6 L -40 60 L -20 60 L 20 6 Z" fill="#6c6956" stroke={C.ink} strokeWidth={4} />
            <circle cx={-26} cy={-34} r={6} fill={RED} />
          </g>
        );
      })}
    </svg>
  );
};

export const Board2: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <Sticky x={3300} y={300} text={'born\n1905'} rot={6} size={56} />
    <Sticky x={3360} y={2000} text={'Moscow\'s plan:\n~2 weeks?'} rot={-6} size={42} at={T.l18} />
    <Sticky x={60} y={980} text={'farmer,\nhunter'} rot={-8} size={50} />

    {/* TRẠM 1: nông trại + bản đồ nhỏ */}
    <Panel {...FARM} rot={-1.5} seed="b2farm">
      <FarmPanel />
    </Panel>
    <Cutout {...MINI} rot={3} seed="b2mini" tape>
      <Aged sepia={0.2} dots={0.1}>
        <FinlandMap w={MINI.w} h={MINI.h} labels={false} markers={[{ll: PLACES.rautjarvi, at: T.rautjarvi, kind: 'pulse', label: 'RAUTJÄRVI', labelSide: 'left'}]} />
      </Aged>
    </Cutout>
    <HandLabel x={1720} y={790} text="a few miles from the border" at={T.border} size={44} rot={-3} />

    {/* TRẠM 2: chiều cao, ít nói */}
    <Cutout {...RULER} rot={-2} seed="b2ruler" texture="white" pin at={T.l12 - 6}>
      <HeightRuler w={RULER.w} h={RULER.h} at={T.five} />
    </Cutout>
    <Cutout x={1150} y={1000} w={420} h={260} rot={4} seed="b2bub" texture="white" tear={false} at={T.much} enter="drop">
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 140, color: C.ink}}>…</div>
    </Cutout>

    {/* TRẠM 3: bia bắn, Civil Guard, 1939 */}
    <Cutout {...TARGET} rot={2} seed="b2tgt" texture="paper" pin at={T.l13 - 6}>
      <Target w={TARGET.w} h={TARGET.h} shots={[T.l13 + 6, T.l13 + 14, T.l13 + 22, T.shooting - 4, T.shooting + 2]} />
      <Marks width={TARGET.w} height={TARGET.h} items={[{kind: 'circle', cx: 320, cy: 320, rx: 110, ry: 100, at: T.shooting, dur: 10, seed: 'tg', width: 10}]} />
    </Cutout>
    <TypedTag x={2260} y={940} text="CIVIL GUARD · AGE 17" at={T.guard} rot={-4} w={760} size={46} />
    <Stamp x={2720} y={1080} text="WINTER 1939" at={T.y1939} rot={-10} size={80} />

    {/* TRẠM 4: bản đồ xâm lược */}
    <Cutout {...MAP} rot={-1} seed="b2map" pin>
      <Aged sepia={0.2} dots={0.1}>
        <FinlandMap w={MAP.w} h={MAP.h} arrows={ARROWS} markers={[{ll: PLACES.helsinki, at: T.helsinki + 8, kind: 'burst', size: 0.8}, {ll: PLACES.kollaa, at: T.kollaa, kind: 'pulse', label: 'KOLLAA', labelSide: 'left'}]} />
      </Aged>
      <Marks
        width={MAP.w}
        height={MAP.h}
        items={[
          {kind: 'arrow', from: [560, 760], to: [180, 560], bend: -0.25, at: T.sweden, dur: 12},
          {kind: 'circle', cx: PM(...PLACES.ladoga)[0], cy: PM(...PLACES.ladoga)[1], rx: 90, ry: 70, at: T.ladoga, dur: 12, seed: 'lad'},
          {kind: 'underline', x1: PM(31.2, 61.95)[0], x2: PM(33.2, 62.15)[0], y: PM(32, 62.05)[1] + 34, at: T.road, dur: 12, width: 12},
        ]}
      />
      <Stamp x={320} y={1120} text="NOV 30, 1939" at={T.invades + 2} rot={-8} size={70} />
    </Cutout>
    <Bombers from={T.l16} to={T.helsinki + 8} />
    <TypedTag x={60} y={940} text="NO DECLARATION OF WAR" at={T.l16 + 4} rot={-3} w={820} size={44} color="#b4231b" />
    <Sticky x={60} y={1500} text={'"don\'t invade\nSweden by\nmistake" (?)'} rot={-6} size={40} at={T.story} />

    {/* TRẠM 5: dân số */}
    <Cutout {...POP} rot={1.5} seed="b2pop" texture="white" pin at={T.l17 - 6}>
      <PopulationChart w={POP.w} h={POP.h} at={T.finpop} bigAt={T.seventy} />
    </Cutout>

    {/* TRẠM 6: Kollaa */}
    <TypedTag x={KOL[0] + 40} y={KOL[1] - 260} text="INF. REGT 34 · 6TH COY" at={T.kollaa} rot={-5} w={700} size={40} />
    <FinFlag x={KOL[0] + 30} y={KOL[1] - 120} s={0.8} at={T.road} />
    <HandLabel x={KOL[0] - 520} y={KOL[1] + 60} text="hold the road" at={T.road + 4} size={52} rot={-4} />
    <Stamp x={KOL[0] - 120} y={KOL[1] + 300} text="KOLLAA HOLDS" sub="KOLLAA KESTÄÄ" at={T.holds} rot={-7} size={96} />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [1560, 300], b: [1960, 200], from: T.border - 14, to: T.border},
        {a: [2000, 760], b: [1900, 920], from: T.l12 - 12, to: T.l12, sag: 0.02},
        {a: [2100, 1100], b: [2660, 300], from: T.l13 - 14, to: T.l13},
        {a: [2600, 1180], b: [1100, 1100], from: T.l15 - 16, to: T.l15},
        {a: [1360, 1700], b: [2750, 1200], from: T.l17 - 14, to: T.l17},
      ]}
    />
  </WorldView>
);

export const Board2Sfx: React.FC = () => (
  <>
    <S name="paper" at={BOARDS.b2[0] + 4} volume={0.5} />
    <S name="marker_draw" at={T.border} volume={0.5} />
    <S name="whoosh" at={T.l12 - 10} volume={0.45} />
    <S name="pop" at={T.much} volume={0.7} />
    <S name="whoosh" at={T.l13 - 10} volume={0.45} />
    {[T.l13 + 6, T.l13 + 14, T.l13 + 22, T.shooting - 4, T.shooting + 2].map((f, i) => (
      <S key={f} name="rifle_shot" at={f} volume={0.35} rate={1 + i * 0.03} />
    ))}
    <S name="marker_draw" at={T.shooting} volume={0.5} />
    <S name="stamp" at={T.y1939} volume={0.9} />
    <S name="air_raid" at={T.l15 - 6} volume={0.55} fadeOut={20} dur={T.l17 - T.l15} />
    <S name="hit" at={T.invades} volume={0.7} />
    <S name="stamp" at={T.invades + 2} volume={0.8} />
    <S name="bomber_drone" at={T.l16 - 10} volume={0.7} />
    <S name="explosion_far" at={T.helsinki + 8} volume={0.8} />
    <S name="whoosh" at={T.l17 - 8} volume={0.45} />
    <S name="tick" at={T.finpop} volume={0.5} />
    <S name="riser" at={Math.max(0, T.seventy - 40)} volume={0.4} />
    <S name="hit" at={T.seventy + 10} volume={0.85} />
    <S name="whoosh" at={T.l18 - 10} volume={0.45} />
    <S name="scribble" at={T.sweden} volume={0.5} />
    <S name="whoosh" at={T.l19 - 6} volume={0.45} />
    <S name="marker_draw" at={T.ladoga} volume={0.5} />
    <S name="snow_step" at={T.l20} volume={0.4} />
    <S name="marker_draw" at={T.road} volume={0.55} />
    <S name="stamp" at={T.holds} volume={1} />
    <S name="hit" at={T.holds} volume={0.7} />
  </>
);
