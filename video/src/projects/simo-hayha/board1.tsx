import React from 'react';
import {FinlandMap, PLACES} from '../../art/FinlandMap';
import {PunchText} from '../../components/Text';
import {Board} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Cutout, Polaroid, Sticky, TypedTag, Aged, Fit169} from '../../vox/paper';
import {BOARDS, c} from './clock';
import {RifleDiagram, TallyBoard} from './diagrams';
import {HoodPortrait, Panel, S} from './kit';
import {SledPanel, SniperPanel} from './panels';

// BẢNG 1 (L01–L10): buổi sáng cuối cùng, phát súng, lời hứa của video.
const WW = 3840;
const WH = 2400;

export const T1 = {
  l1: c.at('L01'),
  march: c.at('L01', 'march'),
  forest: c.at('L01', 'frozen'),
  finland: c.at('L01', 'finland'),
  l2: c.at('L02'),
  rifle: c.at('L02', 'rifle'),
  l3: c.at('L03'),
  first: c.at('L03', 'first'),
  l4: c.at('L04'),
  jaw: c.at('L04', 'jaw'),
  l5: c.at('L05'),
  gone: c.at('L05', 'gone'),
  l6: c.at('L06'),
  ninety: c.at('L06', 'ninety'),
  l7: c.at('L07'),
  more: c.at('L07', 'more'),
  l7end: c.end('L07'),
  l8: c.at('L08'),
  iron: c.at('L08', 'iron'),
  patience: c.at('L08', 'patience'),
  l9: c.at('L09'),
  name: c.at('L09', 'simo'),
  l10: c.at('L10'),
  highest: c.at('L10', 'highest'),
  real: c.at('L10', 'real'),
  l10end: c.end('L10'),
};
const T = T1;

const MAP = {x: 160, y: 140, w: 1000, h: 1120};
const SNIPER = {x: 1320, y: 180, w: 1500, h: 844};
const SLED = {x: 2980, y: 220, w: 780, h: 439};
const SKETCH = {x: 3020, y: 760, w: 560, h: 560};
const TALLY = {x: 1300, y: 1180, w: 1300, h: 640};
const RIFLE = {x: 220, y: 1420, w: 1000, h: 420};
const POLA = {x: 2780, y: 1500, w: 540, h: 640};

// điểm loé đầu nòng của kẻ địch trong khung xạ thủ (đổi sang toạ độ thế giới)
const FLASH = [SNIPER.x + (1520 / 1920) * SNIPER.w, SNIPER.y + (560 / 1080) * SNIPER.h];
const ctr = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: BOARDS.b1[0], x: 660, y: 720, z: 1.05},
  {at: T.finland, dur: 24, ease: 'smooth', x: 740, y: 900, z: 1.3},
  {at: T.l2 + 4, dur: 18, x: ctr(SNIPER)[0], y: ctr(SNIPER)[1], z: 1.2},
  {at: T.first + 2, dur: 10, x: FLASH[0] - 80, y: FLASH[1], z: 1.75},
  {at: T.jaw + 2, dur: 8, x: ctr(SNIPER)[0], y: ctr(SNIPER)[1], z: 1.25},
  {at: T.l5 + 4, dur: 16, x: ctr(SLED)[0], y: ctr(SLED)[1] + 40, z: 1.75},
  {at: T.gone - 6, dur: 14, x: ctr(SKETCH)[0], y: ctr(SKETCH)[1], z: 1.6},
  {at: T.l6 + 2, dur: 14, x: 3220, y: 1440, z: 1.45},
  {at: T.l7 + 4, dur: 16, x: ctr(TALLY)[0], y: ctr(TALLY)[1], z: 1.3},
  {at: T.l8 + 4, dur: 16, x: ctr(RIFLE)[0] + 80, y: ctr(RIFLE)[1] + 60, z: 1.3},
  {at: T.l9 + 2, dur: 16, x: ctr(POLA)[0] - 60, y: ctr(POLA)[1], z: 1.25},
  {at: T.l10 + 4, dur: 18, x: 1950, y: 2010, z: 1.25},
  {at: T.real + 2, dur: 26, ease: 'smooth', x: WW / 2, y: WH / 2, z: 0.48},
];

const SHAKES: WorldShake[] = [
  {at: T.march, amp: 8, dur: 8},
  {at: T.jaw, amp: 26, dur: 16},
  {at: T.more, amp: 14, dur: 12},
  {at: T.real, amp: 16, dur: 12},
];

/** Phác thảo chân dung nhìn nghiêng, khoanh đỏ quanh hàm. */
const Sketch: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    <path d={`M ${w * 0.62} ${h * 0.14} Q ${w * 0.28} ${h * 0.1} ${w * 0.26} ${h * 0.45} Q ${w * 0.26} ${h * 0.68} ${w * 0.42} ${h * 0.78} L ${w * 0.6} ${h * 0.8} Q ${w * 0.66} ${h * 0.7} ${w * 0.66} ${h * 0.62} L ${w * 0.72} ${h * 0.58} L ${w * 0.68} ${h * 0.5} Q ${w * 0.74} ${h * 0.44} ${w * 0.7} ${h * 0.36} Q ${w * 0.72} ${h * 0.2} ${w * 0.62} ${h * 0.14} Z`} fill="none" stroke="#3a3530" strokeWidth={6} strokeLinejoin="round" />
    <circle cx={w * 0.56} cy={h * 0.4} r={8} fill="#3a3530" />
    <path d={`M ${w * 0.3} ${h * 0.3} Q ${w * 0.4} ${h * 0.2} ${w * 0.55} ${h * 0.2}`} stroke="#3a3530" strokeWidth={3} fill="none" opacity={0.5} />
  </svg>
);

export const Board1: React.FC = () => (
  <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
    <Board width={WW} height={WH} />
    <Sticky x={2560} y={1880} text={'Kollaa front\nLadoga Karelia'} rot={6} size={44} />
    <Sticky x={3420} y={2060} text={'Infantry Regt 34\n6th Company'} rot={-5} size={40} />
    <Sticky x={160} y={1240} text={'-40° winters'} rot={4} size={50} />
    <Sticky x={60} y={1960} text={'1939–40\nWinter War'} rot={-7} size={48} />
    <Sticky x={3480} y={1360} text={'aged 34'} rot={8} size={52} at={T.l9 + 20} />

    {/* TRẠM 1: bản đồ Phần Lan */}
    <Cutout {...MAP} rot={-1.5} seed="b1map" tape>
      <Aged sepia={0.2} dots={0.1}>
        <FinlandMap w={MAP.w} h={MAP.h} focusFinland={T.finland} markers={[{ll: PLACES.kollaa, at: T.forest, kind: 'pulse', label: 'KOLLAA', labelSide: 'left'}]} />
      </Aged>
      <Marks width={MAP.w} height={MAP.h} items={[{kind: 'circle', cx: 520, cy: 600, rx: 330, ry: 480, at: T.finland, dur: 18, seed: 'fin', width: 12}]} />
      <Stamp x={300} y={1000} text="MARCH 6, 1940" at={T.march + 2} rot={-8} size={64} />
    </Cutout>

    {/* TRẠM 2: xạ thủ trong tuyết, phát súng */}
    <Panel {...SNIPER} rot={1.5} seed="b1snp" at={T.l2 - 12} freezeAt={T.jaw + 4}>
      <SniperPanel enemyAt={T.first} hit={T.jaw} />
    </Panel>
    <HandLabel x={2300} y={1050} text="he's seen first" at={T.first + 6} size={56} rot={-3} />
    <TypedTag x={1400} y={60} text="WOUNDED · MARCH 6" at={T.jaw + 8} rot={-3} w={760} size={48} color="#b4231b" />

    {/* TRẠM 3: kéo về trên xe trượt, phác thảo hàm */}
    <Panel {...SLED} rot={-2.5} seed="b1sled" at={T.l5 - 10}>
      <SledPanel from={T.l5 - 10} />
    </Panel>
    <Cutout {...SKETCH} rot={3} seed="b1sk" texture="paper" pin at={T.l5 + 30}>
      <Sketch w={SKETCH.w} h={SKETCH.h} />
      <Marks width={SKETCH.w} height={SKETCH.h} items={[{kind: 'circle', cx: 300, cy: 400, rx: 150, ry: 90, at: T.gone, dur: 12, seed: 'jaw', width: 10}]} />
    </Cutout>
    <TypedTag x={2920} y={1380} text="≈ 98 DAYS ON THE FRONT" at={T.ninety} rot={-4} w={760} size={46} />

    {/* TRẠM 4: bảng đếm vạch, 500+ */}
    <Cutout {...TALLY} rot={-1} seed="b1tally" texture="kraft" pin at={T.l7 - 8}>
      <TallyBoard w={TALLY.w} h={TALLY.h} start={T.l7} end={T.more} bigAt={T.more} groups={60} />
    </Cutout>
    <HandLabel x={1360} y={1830} text="depending on who's counting" at={T.l7 + 12} size={48} rot={-2} />

    {/* TRẠM 5: súng không ống ngắm */}
    <Cutout {...RIFLE} rot={2} seed="b1rifle" texture="white" pin at={T.l8 - 6}>
      <RifleDiagram w={RIFLE.w} h={RIFLE.h} />
      <Marks width={RIFLE.w} height={RIFLE.h} items={[{kind: 'circle', cx: 400, cy: 170, rx: 170, ry: 70, at: T.l8 + 6, dur: 12, seed: 'nos', width: 10}]} />
      <HandLabel x={600} y={110} text="NO SCOPE" at={T.l8 + 14} size={64} rot={-6} />
    </Cutout>
    <Sticky x={1000} y={1890} text="patience" rot={-6} size={60} at={T.patience} />

    {/* TRẠM 6: chân dung, câu hỏi */}
    <Polaroid {...POLA} rot={-5} at={T.l9 - 4} enter="right" caption="Simo Häyhä">
      <Aged gray={1} sepia={0.25} dots={0.18}>
        <Fit169 w={POLA.w - 48} h={POLA.h - 134}>
          <HoodPortrait expr="neutral" />
        </Fit169>
      </Aged>
    </Polaroid>
    <HandLabel x={1360} y={1960} text="highest count of any war?" at={T.highest} size={76} rot={-3} dur={20} />
    <PunchText text="?" at={T.real} x={2560} y={2040} size={300} color="#d42a1c" rotate={8} />

    <Strings
      width={WW}
      height={WH}
      items={[
        {a: [1000, 300], b: [2070, 200], from: T.l2 - 18, to: T.l2 + 2},
        {a: [2800, 400], b: [3360, 240], from: T.l5 - 16, to: T.l5 + 2},
        {a: [3300, 780], b: [3200, 1380], from: T.l6 - 14, to: T.l6},
        {a: [2950, 1420], b: [2400, 1200], from: T.l7 - 16, to: T.l7 + 2},
        {a: [1300, 1500], b: [1180, 1440], from: T.l8 - 14, to: T.l8, sag: 0.02},
        {a: [1210, 1640], b: [3050, 1520], from: T.l9 - 18, to: T.l9},
      ]}
    />
  </WorldView>
);

export const Board1Sfx: React.FC = () => (
  <>
    <S name="lamp_click" at={2} volume={0.9} />
    <S name="wind_loop" at={0} dur={BOARDS.b1[1]} volume={0.35} fadeIn={20} fadeOut={20} />
    <S name="stamp" at={T.march + 2} volume={0.9} />
    <S name="marker_draw" at={T.finland} volume={0.6} />
    <S name="whoosh" at={T.l2 - 10} volume={0.5} />
    <S name="snow_step" at={T.l2 + 10} volume={0.4} />
    <S name="heartbeat" at={T.l3} volume={0.6} />
    <S name="whoosh_short" at={T.first - 8} volume={0.5} />
    <S name="rifle_shot" at={T.jaw} volume={1} />
    <S name="flash" at={T.jaw} volume={0.6} />
    <S name="tape_stop" at={T.jaw + 4} volume={0.6} />
    <S name="paper" at={T.jaw + 8} volume={0.5} />
    <S name="whoosh" at={T.l5 - 8} volume={0.5} />
    <S name="snow_step" at={T.l5} volume={0.45} />
    <S name="snow_step" at={T.l5 + 30} volume={0.4} rate={0.95} />
    <S name="marker_draw" at={T.gone} volume={0.55} />
    <S name="typewriter" at={T.ninety} volume={0.5} />
    <S name="whoosh" at={T.l7 - 8} volume={0.5} />
    {new Array(14).fill(0).map((_, i) => (
      <S key={i} name="pen_scratch" at={T.l7 + Math.round((i / 14) * (T.more - T.l7))} volume={0.25} dur={6} />
    ))}
    <S name="hit" at={T.more} volume={0.9} />
    <S name="whoosh" at={T.l8 - 8} volume={0.45} />
    <S name="marker_draw" at={T.l8 + 6} volume={0.5} />
    <S name="paper" at={T.patience} volume={0.5} />
    <S name="shutter" at={T.l9 - 2} volume={0.7} />
    <S name="scribble" at={T.highest} volume={0.5} />
    <S name="riser" at={Math.max(0, T.real - 60)} volume={0.45} />
    <S name="hit" at={T.real} volume={0.9} />
  </>
);
