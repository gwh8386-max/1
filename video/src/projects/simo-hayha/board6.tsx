import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FinlandMap, PLACES} from '../../art/FinlandMap';
import {PunchText, Typewriter} from '../../components/Text';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {TearCalendar} from '../../vox/docs';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Aged, Cutout, Fit169, Polaroid, Sticky, TypedTag} from '../../vox/paper';
import {BOARDS, c, em, TOTAL} from './clock';
import {CasualtyHeads, JawXray, RankFlip} from './diagrams';
import {FinFlag, HoodPortrait, Panel, S} from './kit';
import {EmptyClearingPanel, HospitalPanel, OldManPanel, SniperPanel} from './panels';

// BẢNG 6 (L59–L73): 13 tháng 3, cái giá, sau chiến tranh, khoảng rừng trống.
const WW = 4400;
const WH = 2600;

export const T6 = {
  l59: c.at('L59'),
  l60: c.at('L60'),
  explosive: em('L60'),
  l61: c.at('L61'),
  week: c.at('L61', 'week'),
  wakes: c.at('L61', 'wakes'),
  l62: c.at('L62'),
  ends: em('L62'),
  l63: c.at('L63'),
  tenth: c.at('L63', 'tenth'),
  karelia: em('L63'),
  l64: c.at('L64'),
  independent: c.at('L64', 'independent'),
  fell: em('L64'),
  l65: c.at('L65'),
  finns: c.at('L65', 'finns'),
  soviet: em('L65'),
  l66: c.at('L66'),
  jaw: em('L66'),
  l67: c.at('L67'),
  lieutenant: em('L67'),
  l68: c.at('L68'),
  president: em('L68'),
  l69: c.at('L69'),
  practice: em('L69'),
  l70: c.at('L70'),
  could: em('L70'),
  l70end: c.end('L70'),
  l71: c.at('L71'),
  hamina: em('L71'),
  l72: c.at('L72'),
  about: em('L72'),
  l73: c.at('L73'),
  up: em('L73'),
  l73end: c.end('L73'),
};
const T = T6;

const REPRISE = {x: 200, y: 200, w: 1300, h: 731};
const CAL = {x: 1640, y: 230, w: 380, h: 460};
const HOSP = {x: 2120, y: 200, w: 1200, h: 675};
const MAP = {x: 200, y: 1080, w: 900, h: 1010};
const CAS = {x: 1220, y: 1040, w: 1000, h: 900};
const XRAY = {x: 2360, y: 1000, w: 600, h: 440};
const RANK = {x: 2400, y: 1520, w: 480, h: 520};
const OLD = {x: 3080, y: 960, w: 1120, h: 630};
const QUOTE = {x: 3080, y: 1700, w: 1120, h: 330};
const POLA = {x: 2380, y: 2060, w: 440, h: 500};
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: BOARDS.b6[0], x: ctr(REPRISE)[0], y: ctr(REPRISE)[1], z: 1.25},
  {at: T.l61 + 4, dur: 16, x: 2400, y: 560, z: 1.12},
  {at: T.ends + 2, dur: 10, x: ctr(HOSP)[0], y: ctr(HOSP)[1], z: 1.3},
  {at: T.l63 + 4, dur: 18, x: ctr(MAP)[0] + 60, y: ctr(MAP)[1], z: 1.2},
  {at: T.l65 + 4, dur: 16, x: ctr(CAS)[0], y: ctr(CAS)[1], z: 1.1},
  {at: T.l66 + 2, dur: 14, x: ctr(XRAY)[0], y: ctr(XRAY)[1] + 40, z: 1.45},
  {at: T.l67 + 2, dur: 14, x: ctr(RANK)[0], y: ctr(RANK)[1], z: 1.4},
  {at: T.l68 + 4, dur: 16, x: ctr(OLD)[0], y: ctr(OLD)[1], z: 1.4},
  {at: T.practice - 2, dur: 10, x: ctr(OLD)[0], y: ctr(OLD)[1] + 200, z: 1.15},
  {at: T.l70 + 4, dur: 14, x: ctr(QUOTE)[0], y: ctr(QUOTE)[1] - 40, z: 1.3},
  {at: T.l71 + 4, dur: 16, x: ctr(POLA)[0] + 80, y: ctr(POLA)[1] - 60, z: 1.3},
  {at: T.l72 + 6, dur: 30, ease: 'smooth', x: WW / 2, y: WH / 2, z: 0.44},
  {at: T.up - 6, dur: 30, ease: 'smooth', x: ctr(REPRISE)[0], y: ctr(REPRISE)[1], z: 1.48},
];

const SHAKES: WorldShake[] = [
  {at: T.ends, amp: 18, dur: 14},
  {at: T.practice, amp: 14, dur: 12},
  {at: T.up, amp: 10, dur: 12},
];

export const Board6: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <Sticky x={3500} y={260} text={'Moscow Peace\nTreaty\nMarch 12-13'} rot={6} size={40} at={T.ends} />
    <Sticky x={60} y={2160} text={'105 days\nof war'} rot={-6} size={48} at={T.finns} />
    <Sticky x={3900} y={2080} text={'d. April 1,\n2002'} rot={6} size={44} at={T.hamina} />

    {/* TRẠM 1: nhắc lại khung xạ thủ đóng băng; cuối video: khoảng rừng trống */}
    <Panel {...REPRISE} rot={-1.5} seed="b6rep" freezeAt={BOARDS.b6[0]}>
      <SniperPanel hit={BOARDS.b6[0] - 30} />
    </Panel>
    <TypedTag x={260} y={960} text="EXPLOSIVE ROUND?" at={T.explosive} rot={-3} w={640} size={46} color="#b4231b" />
    <Panel {...REPRISE} rot={-1.5} seed="b6empty" at={T.l73 - 10}>
      <EmptyClearingPanel />
    </Panel>

    {/* TRẠM 2: lịch, bệnh viện, hoà bình */}
    <Cutout {...CAL} rot={5} seed="b6cal" texture="none" tear={false} shadow={0.8}>
      <TearCalendar w={CAL.w} h={CAL.h} month="MAR" year="1940" days={['6', '7', '8', '9', '10', '11', '12', '13']} flips={[0, 1, 2, 3, 4, 5, 6].map((i) => T.l61 + 6 + i * Math.round((T.wakes - T.l61) / 7))} />
    </Cutout>
    <Panel {...HOSP} rot={1.5} seed="b6hosp" at={T.l61 - 6}>
      <HospitalPanel wakeAt={T.wakes} />
    </Panel>
    <Stamp x={ctr(HOSP)[0]} y={ctr(HOSP)[1]} text="PEACE" sub="MARCH 13, 1940" at={T.ends} rot={-8} size={120} />

    {/* TRẠM 3: bản đồ đất bị cắt, Kollaa không thất thủ */}
    <Cutout {...MAP} rot={-1} seed="b6map" pin>
      <Aged sepia={0.2} dots={0.1}>
        <FinlandMap w={MAP.w} h={MAP.h} ceded={T.tenth} markers={[{ll: PLACES.kollaa, at: T.l63, kind: 'dot', label: 'KOLLAA', labelSide: 'left'}]} />
      </Aged>
      <Marks width={MAP.w} height={MAP.h} items={[{kind: 'circle', cx: 640, cy: 880, rx: 230, ry: 140, at: T.karelia, dur: 12, seed: 'kar'}]} />
    </Cutout>
    <TypedTag x={240} y={980} text="≈ 10% OF FINLAND CEDED" at={T.tenth + 10} rot={-3} w={720} size={44} color="#b4231b" />
    <FinFlag x={900} y={1500} s={1.1} at={T.independent} />
    <HandLabel x={200} y={2110} text="never captured" at={T.fell} size={60} rot={-3} />

    {/* TRẠM 4: tổn thất */}
    <Cutout {...CAS} rot={1.5} seed="b6cas" texture="white" pin at={T.l65 - 6}>
      <CasualtyHeads w={CAS.w} h={CAS.h} finAt={T.finns - 6} sovAt={T.soviet - 30} />
    </Cutout>

    {/* TRẠM 5: hàm, quân hàm, về già */}
    <Cutout {...XRAY} rot={-3} seed="b6xray" texture="none" tear={false} pin at={T.l66 - 6}>
      <JawXray w={XRAY.w} h={XRAY.h} at={T.jaw - 10} />
    </Cutout>
    <Cutout {...RANK} rot={3} seed="b6rank" texture="white" pin at={T.l67 - 6}>
      <RankFlip w={RANK.w} h={RANK.h} at={T.lieutenant - 6} />
    </Cutout>
    <TypedTag x={2300} y={2050} text="BY MANNERHEIM" at={T.l67 + 10} rot={-4} w={560} size={40} />
    <Panel {...OLD} rot={-1.5} seed="b6old" at={T.l68 - 8}>
      <OldManPanel />
    </Panel>
    <Sticky x={3880} y={680} text={'hunting w/\nPresident\nKekkonen'} rot={7} size={40} at={T.president} />
    <PunchText text={'"PRACTICE."'} at={T.practice} out={T.l70end} x={ctr(OLD)[0]} y={OLD.y + OLD.h - 110} size={170} color="#f0b72f" rotate={-4} />

    {/* TRẠM 6: câu trích, chân dung cuối */}
    <Cutout {...QUOTE} rot={1} seed="b6quote" texture="paper" pin at={T.l70 - 6}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 50}}>
        <Typewriter text={'"I did what I was told,\n as well as I could."'} from={T.l70 + 6} to={T.could} size={52} color="#22201c" />
      </div>
      <div style={{position: 'absolute', right: 40, bottom: 26, fontFamily: '"Special Elite"', fontSize: 28, opacity: 0.7}}>paraphrase, late-life interview</div>
    </Cutout>
    <Polaroid {...POLA} rot={-4} at={T.l71 - 4} enter="up" caption="1905–2002 · Hamina">
      <Aged gray={1} sepia={0.3} dots={0.2}>
        <Fit169 w={POLA.w - 48} h={POLA.h - 134}>
          <HoodPortrait expr="smirk" old outfit="shirt" hat="cap" />
        </Fit169>
      </Aged>
    </Polaroid>
    <HandLabel x={2900} y={2200} text="219?  500?  700?" at={T.l72} size={70} rot={-3} color="#6b645a" />
    <Marks width={WW} height={WH} items={[{kind: 'underline', x1: 2890, x2: 3560, y: 2250, at: T.about, dur: 10, width: 8}]} />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [1450, 300], b: [1830, 250], from: T.l61 - 12, to: T.l61, sag: 0.03},
        {a: [2600, 870], b: [650, 1100], from: T.l63 - 16, to: T.l63},
        {a: [1050, 1300], b: [1720, 1060], from: T.l65 - 14, to: T.l65},
        {a: [2200, 1200], b: [2660, 1020], from: T.l66 - 12, to: T.l66},
        {a: [2660, 1440], b: [2640, 1540], from: T.l67 - 10, to: T.l67, sag: 0.02},
        {a: [2880, 1700], b: [3640, 980], from: T.l68 - 14, to: T.l68},
        {a: [3640, 1590], b: [3640, 1720], from: T.l70 - 10, to: T.l70, sag: 0.02},
        {a: [3100, 2000], b: [2600, 2080], from: T.l71 - 12, to: T.l71},
      ]}
    />
  </WorldView>
);

/** Con dấu tiêu đề cuối, giữa khung, sau chữ "up". */
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = T.up + 26;
  if (frame < at) {
    return null;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(10,8,6,0.35)', opacity: interpolate(frame, [at - 6, at + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <Stamp x={960} y={500} text="THE WHITE DEATH" sub="SIMO HÄYHÄ · 1905–2002" at={at} rot={-6} size={150} color="#e23a2a" />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [TOTAL - 20, TOTAL - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

export const Board6Sfx: React.FC = () => (
  <>
    <S name="tape_stop" at={BOARDS.b6[0] + 4} volume={0.5} />
    <S name="wind_loop" at={BOARDS.b6[0]} dur={T.l61 - BOARDS.b6[0]} volume={0.3} fadeIn={20} fadeOut={20} />
    <S name="typewriter" at={T.explosive} volume={0.5} />
    <S name="whoosh" at={T.l61 - 10} volume={0.45} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <S key={i} name="page_flip" at={T.l61 + 6 + i * Math.round((T.wakes - T.l61) / 7)} volume={0.55} />
    ))}
    <S name="heartbeat" at={T.l61} volume={0.5} />
    <S name="heartbeat" at={T.l61 + 50} volume={0.5} />
    <S name="stamp" at={T.ends} volume={1} />
    <S name="hit" at={T.ends} volume={0.7} />
    <S name="whoosh" at={T.l63 - 10} volume={0.45} />
    <S name="marker_draw" at={T.tenth} volume={0.5} />
    <S name="marker_draw" at={T.karelia} volume={0.5} />
    <S name="paper" at={T.independent} volume={0.5} />
    <S name="whoosh" at={T.l65 - 10} volume={0.45} />
    {new Array(10).fill(0).map((_, i) => (
      <S key={`t${i}`} name="tick" at={T.soviet - 30 + i * 4} volume={0.35} />
    ))}
    <S name="whoosh" at={T.l66 - 10} volume={0.4} />
    <S name="marker_draw" at={T.jaw} volume={0.4} />
    <S name="stamp" at={T.lieutenant} volume={0.7} />
    <S name="whoosh" at={T.l68 - 10} volume={0.45} />
    <S name="paper" at={T.president} volume={0.5} />
    <S name="hit" at={T.practice} volume={0.85} />
    <S name="typewriter" at={T.l70 + 6} volume={0.5} />
    <S name="shutter" at={T.l71 - 2} volume={0.6} />
    <S name="scribble" at={T.l72} volume={0.4} />
    <S name="whoosh" at={T.l72 + 6} volume={0.5} />
    <S name="wind_loop" at={T.l73 - 20} dur={TOTAL - T.l73 + 20} volume={0.4} fadeIn={20} fadeOut={30} />
    <S name="rifle_shot" at={T.up} volume={0.9} />
    <S name="stamp" at={T.up + 26} volume={1} />
    <S name="hit" at={T.up + 26} volume={0.6} />
  </>
);
