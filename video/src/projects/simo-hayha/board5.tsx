import React from 'react';
import {FONT} from '../../lib/fonts';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {Hl} from '../../vox/docs';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Cutout, Sticky, TypedTag} from '../../vox/paper';
import {BOARDS, c, em} from './clock';
import {Clipping, CompareChart, DiaryPage} from './diagrams';
import {Panel, S} from './kit';
import {WitnessPanel} from './panels';

// BẢNG 5 (L48–L58): ai đếm? ba con số, nhân chứng, so sánh, biệt danh.
const WW = 3840;
const WH = 2400;

const T = {
  l48: c.at('L48'),
  counting: em('L48'),
  l49: c.at('L49'),
  feb: c.at('L49', 'february'),
  rifle: em('L49'),
  l50: c.at('L50'),
  diary: c.at('L50', 'diary'),
  five: em('L50'),
  l51: c.at('L51'),
  y2017: c.at('L51', 'public'),
  death: em('L51'),
  l52: c.at('L52'),
  verify: em('L52'),
  l53: c.at('L53'),
  saw: c.at('L53', 'saw'),
  check: em('L53'),
  l54: c.at('L54'),
  exact: em('L54'),
  l55: c.at('L55'),
  lowest: c.at('L55', 'lowest'),
  weeks: em('L55'),
  l56: c.at('L56'),
  year: em('L56'),
  l57: c.at('L57'),
  white: c.at('L57', 'white'),
  soviets: em('L57'),
  l58: c.at('L58'),
  papers: em('L58'),
  stuck: c.at('L58', 'stuck'),
};

const REPORT = {x: 200, y: 360, w: 1000, h: 860};
const DIARY = {x: 1340, y: 360, w: 1000, h: 640};
const WIT = {x: 2500, y: 360, w: 1180, h: 664};
const CMP = {x: 700, y: 1380, w: 1500, h: 700};
const CLIP1 = {x: 2420, y: 1320, w: 620, h: 760};
const CLIP2 = {x: 3120, y: 1360, w: 600, h: 720};
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: BOARDS.b5[0], x: 1900, y: 700, z: 0.75},
  {at: T.l49 + 2, dur: 16, x: ctr(REPORT)[0], y: ctr(REPORT)[1], z: 1.3},
  {at: T.l50 + 2, dur: 16, x: ctr(DIARY)[0], y: ctr(DIARY)[1] + 60, z: 1.35},
  {at: T.l52 + 2, dur: 14, x: 1900, y: 1150, z: 1.3},
  {at: T.l53 + 2, dur: 16, x: ctr(WIT)[0], y: ctr(WIT)[1] + 40, z: 1.3},
  {at: T.l54 + 2, dur: 18, x: 1900, y: 800, z: 0.72},
  {at: T.l55 + 4, dur: 16, x: ctr(CMP)[0], y: ctr(CMP)[1], z: 1.12},
  {at: T.l57 + 4, dur: 16, x: ctr(CLIP1)[0] + 300, y: ctr(CLIP1)[1], z: 1.15},
];

const SHAKES: WorldShake[] = [
  {at: T.exact + 4, amp: 14, dur: 12},
  {at: T.weeks, amp: 10, dur: 10},
];

export const Board5: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <HandLabel x={1260} y={110} text="WHO WAS COUNTING?" at={T.counting - 4} size={110} rot={-2} dur={18} />
    <Sticky x={120} y={1360} text={'Kollaa:\nno one walks\ninto no-man\'s\nland'} rot={-6} size={40} at={T.check} />
    <Sticky x={3420} y={1080} text={'Soviet\nsniper'} rot={7} size={48} at={T.l56} />

    {/* TRẠM 1: báo cáo quân đội */}
    <Cutout {...REPORT} rot={-1.5} seed="b5rep" texture="paper" pin>
      <div style={{position: 'absolute', inset: 0, padding: '60px 64px', fontFamily: FONT.typewriter, fontSize: 40, color: '#22201c', lineHeight: 1.6}}>
        <div style={{textAlign: 'center', color: '#b4231b', letterSpacing: 8, fontSize: 44}}>FINNISH ARMY</div>
        <div>17 FEBRUARY 1940</div>
        <div>KOLLAA FRONT · JR 34</div>
        <div style={{borderTop: '3px dashed rgba(0,0,0,0.35)', margin: '24px 0'}} />
        <div>CPL. SIMO HÄYHÄ</div>
        <div>
          <Hl at={T.rifle}>219 CONFIRMED RIFLE KILLS</Hl>
        </div>
        <div style={{marginTop: 40, fontSize: 26, opacity: 0.7}}>(summary, not the original document)</div>
      </div>
    </Cutout>

    {/* TRẠM 2: nhật ký */}
    <Cutout {...DIARY} rot={2} seed="b5diary" texture="white" pin at={T.l50 - 6}>
      <DiaryPage w={DIARY.w} h={DIARY.h} circleAt={T.five} />
    </Cutout>
    <TypedTag x={1400} y={260} text="HIS OWN WARTIME DIARY" at={T.diary} rot={-3} w={700} size={42} />
    <Stamp x={2050} y={880} text="MADE PUBLIC" sub="2017" at={T.y2017} rot={-10} size={66} />
    <HandLabel x={1500} y={1030} text="† 2002" at={T.death} size={64} rot={-4} color="#2a2a33" />
    <Sticky x={1820} y={1040} text={'+200 more\nwith an SMG?'} rot={5} size={44} at={T.l52 + 6} />
    <HandLabel x={1760} y={1350} text="unverified" at={T.verify} size={50} rot={-3} />

    {/* TRẠM 3: nhân chứng */}
    <Panel {...WIT} rot={1.5} seed="b5wit" at={T.l53 - 8}>
      <WitnessPanel fallAt={T.saw + 4} />
    </Panel>
    <TypedTag x={2560} y={1060} text='"CONFIRMED" = SOMEONE SAW HIM FALL' at={T.saw} rot={-2} w={1060} size={38} />
    <HandLabel x={2600} y={1180} text="nobody went to check" at={T.check} size={50} rot={-3} />

    {/* Không ai biết con số chính xác */}
    <Stamp x={1900} y={760} text="EXACT NUMBER: UNKNOWN" at={T.exact} rot={-6} size={84} />

    {/* TRẠM 4: so sánh */}
    <Cutout {...CMP} rot={-1} seed="b5cmp" texture="white" pin at={T.l55 - 6}>
      <CompareChart w={CMP.w} h={CMP.h} aAt={T.lowest} bAt={T.l56 + 10} />
      <Marks
        width={CMP.w}
        height={CMP.h}
        items={[
          {kind: 'underline', x1: 60, x2: 360, y: 340, at: T.weeks, dur: 8, width: 10},
          {kind: 'underline', x1: 60, x2: 360, y: 580, at: T.year, dur: 8, width: 10},
        ]}
      />
    </Cutout>

    {/* TRẠM 5: biệt danh */}
    <Cutout {...CLIP2} rot={4} seed="b5clip2" texture="none" tear="trbl" pin at={T.l57 + 2}>
      <Clipping w={CLIP2.w} h={CLIP2.h} head="БЕЛАЯ СМЕРТЬ?" mast="SOVIET SIDE?" ru />
    </Cutout>
    <Cutout {...CLIP1} rot={-3} seed="b5clip1" texture="none" tear="trbl" pin at={T.l57 - 6}>
      <Clipping w={CLIP1.w} h={CLIP1.h} head={'"THE WHITE\nDEATH"'} mast="FINNISH PRESS · 1940" />
    </Cutout>
    <HandLabel x={2500} y={2100} text="who said it first?" at={T.papers} size={56} rot={-3} />
    <Marks width={WW} height={WH} items={[{kind: 'circle', cx: ctr(CLIP1)[0], cy: CLIP1.y + 120, rx: 300, ry: 80, at: T.papers, dur: 12, seed: 'pp'}]} />
    <TypedTag x={2900} y={1220} text="IT STUCK" at={T.stuck} rot={5} w={420} size={44} color="#b4231b" />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [700, 380], b: [1840, 380], from: T.l50 - 14, to: T.l50, sag: 0.04},
        {a: [1840, 380], b: [3090, 380], from: T.l53 - 14, to: T.l53, sag: 0.04},
        {a: [1100, 1200], b: [1450, 1400], from: T.l55 - 14, to: T.l55},
        {a: [2150, 1500], b: [2700, 1340], from: T.l57 - 14, to: T.l57},
      ]}
    />
  </WorldView>
);

export const Board5Sfx: React.FC = () => (
  <>
    <S name="scribble" at={T.counting - 4} volume={0.6} />
    <S name="whoosh" at={T.l49 - 10} volume={0.45} />
    <S name="typewriter" at={T.feb} volume={0.5} />
    <S name="highlighter" at={T.rifle} volume={0.8} />
    <S name="whoosh" at={T.l50 - 10} volume={0.45} />
    <S name="page_flip" at={T.l50 - 4} volume={0.6} />
    <S name="marker_draw" at={T.five} volume={0.55} />
    <S name="stamp" at={T.y2017} volume={0.85} />
    <S name="paper" at={T.l52 + 6} volume={0.5} />
    <S name="whoosh" at={T.l53 - 10} volume={0.45} />
    <S name="rifle_shot" at={T.saw} volume={0.35} />
    <S name="stamp" at={T.exact} volume={1} />
    <S name="hit" at={T.exact + 2} volume={0.6} />
    <S name="whoosh" at={T.l55 - 10} volume={0.45} />
    <S name="tick" at={T.lowest} volume={0.5} />
    <S name="pop" at={T.weeks} volume={0.6} />
    <S name="riser" at={T.l56} volume={0.3} />
    <S name="pop" at={T.year} volume={0.6} />
    <S name="whoosh" at={T.l57 - 10} volume={0.45} />
    <S name="paper" at={T.l57 - 6} volume={0.6} />
    <S name="paper" at={T.l57 + 2} volume={0.6} />
    <S name="marker_draw" at={T.papers} volume={0.5} />
    <S name="stamp" at={T.stuck} volume={0.6} />
  </>
);
