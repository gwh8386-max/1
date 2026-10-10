import React from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Firing, firingShots} from '../../art/Battle';
import {CICRoom} from '../../art/Interior';
import {GulfMap} from '../../art/Map';
import {DaySea, Destroyer} from '../../art/Sea';
import {Character} from '../../components/Character';
import {DraftBadge, MusicBed, SubtitleTrack} from '../../components/Mix';
import {Grain, Vignette} from '../../components/Overlays';
import {Sfx} from '../../components/Sfx';
import {SceneClock, sec, Timeline} from '../../lib/timeline';
import {Dust, LightLeak, Board, SourceTag, Spotlight} from '../../vox/atmos';
import {CamKey, WorldShake, WorldView} from '../../vox/camera';
import {HeadsVote} from '../../vox/chart';
import {BlankCheck, DocPage, TearCalendar} from '../../vox/docs';
import {HandLabel, Marks, Stamp, Strings} from '../../vox/marks';
import {Aged, Cutout, Fit169, Polaroid, Sticky, TypedTag} from '../../vox/paper';
import data from './lines.json';

export const timeline = data as Timeline;
export const SLUG = 'tonkin-hook';

const WW = 4200;
const WH = 2700;

// Đồng hồ cho cả video (một cảnh liền mạch, máy quay đi trên bảng điều tra).
const tl = timeline;
const TOTAL = sec(tl.duration);
const c = new SceneClock(tl, {id: 'ALL', title: '', meta: {}, lines: tl.lines.map((l) => l.id), start: 0, end: tl.duration}, 0, TOTAL);

// Các mốc neo vào chữ trong lời thoại.
const T = {
  aug: c.at('L01', 'august'),
  gulf: c.at('L01', 'gulf'),
  tonkin: c.at('L01', 'tonkin'),
  l2: c.at('L02'),
  torp: c.at('L02', 'torpedoes'),
  fire: c.at('L02', 'fire'),
  l3: c.at('L03'),
  problem: c.at('L03', 'problem'),
  never: c.at('L03', 'never'),
  happened: c.at('L03', 'happened'),
  l3end: c.end('L03'),
  l4: c.at('L04'),
  president: c.at('L04', 'president'),
  blank: c.at('L04', 'blank'),
  four: c.at('L04', 'four'),
  sixteen: c.at('L04', 'sixteen'),
  zero: c.at('L04', 'zero'),
  l4end: c.end('L04'),
};

// Bố cục trên bảng (toạ độ thế giới, px).
const MAP = {x: 250, y: 300, w: 1560, h: 880};
const POLA = {x: 1560, y: 170, w: 520, h: 600};
const SONAR = {x: 2600, y: 160, w: 1240, h: 700};
const FIRE = {x: 2380, y: 1000, w: 1450, h: 816};
const DOC = {x: 380, y: 1300, w: 1180, h: 1260};
const CAL = {x: 1700, y: 1540, w: 360, h: 440};
const CHECK = {x: 2150, y: 1880, w: 1250, h: 560};
const CHART = {x: 3330, y: 1420, w: 860, h: 1180};

const center = (b: {x: number; y: number; w: number; h: number}) => [b.x + b.w / 2, b.y + b.h / 2];

const KEYS: CamKey[] = [
  {at: 0, x: 1180, y: 700, z: 1.06},
  {at: T.gulf + 4, dur: 22, ease: 'smooth', x: 1010, y: 760, z: 1.3},
  {at: T.l2 + 2, dur: 16, x: center(SONAR)[0], y: center(SONAR)[1] + 10, z: 1.42},
  {at: T.fire + 2, dur: 12, x: center(FIRE)[0], y: center(FIRE)[1], z: 1.25},
  {at: T.l3 + 18, dur: 16, x: 980, y: 1760, z: 1.28},
  {at: T.never + 4, dur: 10, ease: 'smooth', x: 900, y: 1860, z: 1.7},
  {at: T.l4 + 2, dur: 16, x: 2560, y: 2010, z: 1.05},
  {at: T.four, dur: 12, x: center(CHART)[0], y: center(CHART)[1], z: 0.9},
  {at: T.l4end + 26, dur: 24, ease: 'smooth', x: 2100, y: 1350, z: 0.455},
];

const SHOTS = firingShots(T.l3 - T.fire).map((s) => s + T.fire - 4).filter((s) => s < T.l3);

const SHAKES: WorldShake[] = [
  {at: T.aug, amp: 8, dur: 8},
  {at: T.torp, amp: 16, dur: 14},
  ...SHOTS.map((s) => ({at: s, amp: 6, dur: 7})),
  {at: T.happened + 16, amp: 10, dur: 10},
  {at: T.zero, amp: 18, dur: 14},
];

// Cảnh phòng chỉ huy cận mặt thủy thủ sonar (khổ 1920x1080, nhúng vào mảnh giấy).
const SonarScene: React.FC<{shoutAt: number}> = ({shoutAt}) => {
  const frame = useCurrentFrame();
  const shout = frame >= shoutAt;
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <AbsoluteFill style={{filter: 'blur(8px) brightness(0.7)', transform: 'scale(1.3)'}}>
        <CICRoom redAlert={shout ? 1 : 0} />
      </AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <Character
          x={820}
          y={1150}
          scale={2.6}
          outfit="sailor"
          hat="headset"
          expr={shout ? 'shout' : 'focused'}
          talk={shout && frame < shoutAt + 20}
          tremble={shout ? 1 : 0.25}
          sweat
          armL={{a: 20}}
          armR={{a: 150, bend: -0.5, len: 80}}
          seed={21}
        />
      </svg>
      {shout ? <AbsoluteFill style={{background: `rgba(255,30,20,${0.12 + 0.1 * Math.max(0, Math.sin(frame / 3))})`}} /> : null}
    </AbsoluteFill>
  );
};

const MaddoxPhoto: React.FC = () => (
  <AbsoluteFill>
    <DaySea horizon={560}>
      <Destroyer x={980} y={660} s={1.05} lit={false} rock={0.4} />
    </DaySea>
  </AbsoluteFill>
);

const CABLE: React.ComponentProps<typeof DocPage>['lines'] = [
  ['REVIEW OF ACTION MAKES MANY REPORTED'],
  ['CONTACTS AND TORPEDOES FIRED ', {t: 'APPEAR', hl: T.problem + 12}],
  [{t: 'DOUBTFUL.', hl: T.problem + 18}, ' FREAK WEATHER EFFECTS ON RADAR'],
  ['AND OVEREAGER SONARMEN MAY HAVE ACCOUNTED'],
  ['FOR MANY REPORTS.'],
  [{t: 'NO ACTUAL VISUAL SIGHTINGS', hl: T.never}, ' BY MADDOX.'],
  ['SUGGEST COMPLETE EVALUATION BEFORE ANY'],
  ['FURTHER ACTION TAKEN.'],
];

const Tonkin: React.FC = () => {
  const frame = useCurrentFrame();
  // Cú lật ở L03: các khung hoạt hình (lời tuyên bố) đóng băng và bạc màu; tư liệu giữ màu.
  const gray = interpolate(frame, [T.l3, T.l3 + 8], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const claim = {filter: gray > 0 ? `grayscale(${gray}) brightness(${1 - 0.15 * gray})` : undefined};
  const frozen = frame >= T.l3;
  return (
    <WorldView keys={KEYS} width={WW} height={WH} shakes={SHAKES} handheld={0.7}>
      <Board width={WW} height={WH} />

      {/* Ghi chú dán sẵn trên bảng: lấp đầy khoảng trống, kể thêm chuyện */}
      <Sticky x={1640} y={1010} text={'Aug 2:\na real clash'} rot={7} />
      <Sticky x={3760} y={880} text={'DESOTO patrol:\na spy mission'} rot={-6} size={44} />
      <Sticky x={1600} y={1250} text={'Freak\nweather??'} rot={-5} at={T.l3 + 24} />
      <Sticky x={1720} y={2120} text={'Who checked\nthe facts?'} rot={6} size={46} at={T.l4 + 20} />
      <Sticky x={3010} y={1130} text={'Drafted\nmonths\nearlier'} rot={-8} at={T.four + 10} size={46} />

      {/* TRẠM 1: bản đồ + ảnh Maddox */}
      <Cutout {...MAP} rot={-1.5} seed="map" tape>
        <Aged sepia={0.25} dots={0.12}>
          <Fit169 w={MAP.w} h={MAP.h}>
            <GulfMap lang="en" markers={[{ll: [107.2, 19.65], at: T.aug + 10, kind: 'pulse', label: 'AUG 4'}]} />
          </Fit169>
        </Aged>
        <Marks
          width={MAP.w}
          height={MAP.h}
          items={[
            {kind: 'circle', cx: 760, cy: 470, rx: 300, ry: 330, at: T.gulf + 2, dur: 16, seed: 'gulf', width: 12},
            {kind: 'arrow', from: [420, 640], to: [640, 440], bend: 0.25, at: T.tonkin + 8, dur: 10},
          ]}
        />
        <HandLabel x={70} y={650} text="Maddox + Turner Joy" at={T.tonkin + 4} size={54} rot={-5} />
        <Stamp x={1180} y={730} text="AUG 4, 1964" at={T.aug + 2} rot={-9} size={70} />
      </Cutout>
      <Polaroid {...POLA} rot={7} at={T.aug + 18} enter="right" caption="USS Maddox (DD-731)">
        <Aged gray={1} sepia={0.2} dots={0.18}>
          <Fit169 w={POLA.w - 48} h={POLA.h - 134}>
            <MaddoxPhoto />
          </Fit169>
        </Aged>
      </Polaroid>

      {/* TRẠM 2: khung truyện tranh + tàu bắn trong đêm */}
      <Cutout {...SONAR} rot={2.5} seed="sonar" at={T.l2 - 10} enter="drop" pin style={claim}>
        <Freeze frame={T.l3} active={frozen}>
          <Fit169 w={SONAR.w} h={SONAR.h}>
            <SonarScene shoutAt={T.torp} />
          </Fit169>
        </Freeze>
      </Cutout>
      <TypedTag x={2900} y={250} text="REPORTED: TORPEDO ATTACK" at={T.torp + 3} rot={-5} w={1000} size={50} color="#b4231b" />
      <Cutout {...FIRE} rot={-3} seed="fire" at={T.fire - 6} enter="drop" pin style={claim}>
        <Freeze frame={T.l3} active={frozen}>
          <Fit169 w={FIRE.w} h={FIRE.h}>
            <Firing shots={SHOTS} />
          </Fit169>
        </Freeze>
      </Cutout>

      {/* TRẠM 3: bức điện của Herrick, giải mật */}
      <Cutout {...DOC} rot={-2} seed="doc" pin>
        <DocPage header="SECRET" footer="SECRET" meta={['FROM: CAPT. JOHN J. HERRICK', 'ABOARD USS MADDOX', '4 AUGUST 1964']} lines={CABLE} size={34} />
        <Marks width={DOC.w} height={DOC.h} items={[{kind: 'circle', cx: 345, cy: 650, rx: 300, ry: 46, at: T.happened + 2, dur: 12, seed: 'doc'}]} />
        <Stamp x={870} y={470} text="DECLASSIFIED" sub="NSA HISTORY · 2005" at={T.happened + 16} rot={-14} size={72} />
      </Cutout>

      {/* TRẠM 4: lịch, tấm séc khống, phiếu bầu */}
      <Cutout {...CAL} rot={5} seed="cal" texture="none" tear={false} shadow={0.8}>
        <TearCalendar w={CAL.w} h={CAL.h} month="AUG" days={['4', '5', '6', '7']} flips={[T.l4 + 4, T.l4 + 10, T.l4 + 16]} />
      </Cutout>
      <Cutout {...CHECK} rot={-2.5} seed="check" texture="check" tear={false} at={T.l4 + 6} enter="right">
        <BlankCheck
          w={CHECK.w}
          h={CHECK.h}
          amount="ALL NECESSARY STEPS"
          payee="The President"
          date="AUG 7, 1964"
          memo="Southeast Asia"
          signer="U.S. Congress"
          amountAt={T.president}
          signAt={T.blank - 14}
        />
        <Marks width={CHECK.w} height={CHECK.h} items={[{kind: 'circle', cx: 1000, cy: 158, rx: 235, ry: 66, at: T.blank + 4, dur: 12, seed: 'chk'}]} />
      </Cutout>
      <Cutout {...CHART} rot={2} seed="chart" pin at={T.four - 10} enter="drop">
        <HeadsVote w={CHART.w} h={CHART.h} yes={416} no={0} start={T.four} end={T.sixteen + 12} zeroAt={T.zero} title="HOUSE VOTE · AUG 7" note="Senate: 88–2" cols={15} />
      </Cutout>

      {/* Dây đỏ nối các manh mối, kéo theo đường máy quay đi */}
      <Strings
        width={WW}
        height={WH}
        items={[
          {a: [1820, 190], b: [922, 701], from: T.aug + 26, to: T.gulf},
          {a: [1790, 440], b: [3220, 180], from: T.l2 - 14, to: T.l2 + 2},
          {a: [3300, 862], b: [3105, 1016], from: T.fire - 10, to: T.fire + 2},
          {a: [2400, 1520], b: [970, 1318], from: T.l3 + 4, to: T.l3 + 18},
          {a: [1556, 2240], b: [2775, 1892], from: T.l4 - 14, to: T.l4 + 2},
          {a: [3380, 1895], b: [3350, 1640], from: T.four - 12, to: T.four, sag: 0.02},
        ]}
      />
    </WorldView>
  );
};

/** Thẻ tiêu đề cuối: con dấu lớn giữa khung khi máy quay kéo ra toàn bảng. */
const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = T.l4end + 30;
  if (frame < at) {
    return null;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(10,8,6,0.35)', opacity: interpolate(frame, [at - 6, at + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <Stamp x={960} y={520} text="THE BATTLE THAT NEVER WAS" sub="GULF OF TONKIN · 1964" at={at} rot={-6} size={118} color="#e23a2a" />
    </AbsoluteFill>
  );
};

export type TonkinProps = {subtitles?: boolean};

// Video này dày hiệu ứng: hạ chung cả lớp SFX để nền thấp hơn giọng đọc khoảng 8 LU.
const SFX_LEVEL = 0.6;
const S: React.FC<React.ComponentProps<typeof Sfx>> = (p) => <Sfx {...p} volume={(p.volume ?? 0.8) * SFX_LEVEL} />;

export const TonkinHook: React.FC<TonkinProps> = ({subtitles}) => {
  const draft = tl.source === 'estimate';
  const showSubs = subtitles ?? draft;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Tonkin />
      <Spotlight on={4} />
      <LightLeak opacity={0.18} />
      <Dust />
      <Vignette strength={0.55} />
      <Grain opacity={0.09} />
      <TitleCard />
      <SourceTag text="Source: cable from Capt. John J. Herrick, Aug 4, 1964 · NSA history, declassified 2005" at={T.l3 + 22} out={T.l4 - 6} />
      <SourceTag text="Gulf of Tonkin Resolution, Aug 7, 1964 · House 416–0, Senate 88–2" at={T.four + 4} out={T.l4end + 30} />

      {/* Âm thanh */}
      {!draft ? <Audio src={staticFile(`projects/${SLUG}/voice.wav`)} /> : null}
      <MusicBed tl={tl} track="tension" from={0} to={T.l3} vol={0.32} fadeIn={20} fadeOut={3} />
      <MusicBed tl={tl} track="drums" from={T.l4 - 4} to={TOTAL} vol={0.3} fadeIn={6} fadeOut={30} />
      <S name="lamp_click" at={2} volume={0.9} />
      <S name="room_hum_loop" at={0} dur={TOTAL} volume={0.2} fadeIn={10} />
      <S name="sea_loop" at={0} dur={T.l2} volume={0.3} fadeIn={20} fadeOut={10} />
      <S name="stamp" at={T.aug + 2} volume={0.9} />
      <S name="shutter" at={T.aug + 16} volume={0.7} />
      <S name="marker_draw" at={T.gulf + 2} volume={0.6} />
      <S name="scribble" at={T.tonkin + 8} volume={0.6} />
      {KEYS.slice(2).map((k) => (
        <S key={k.at} name="whoosh" at={k.at - Math.round((k.dur ?? 14) * 0.7)} volume={0.55} />
      ))}
      <S name="sonar_ping" at={T.l2 - 4} volume={0.5} />
      <S name="alarm" at={T.torp} volume={0.45} />
      <S name="hit" at={T.torp} volume={0.7} />
      <S name="paper" at={T.torp + 3} volume={0.6} />
      {SHOTS.map((s, i) => (
        <S key={s} name="cannon" at={s} volume={0.35 + 0.25 * random(`tv${i}`)} rate={0.9 + 0.2 * random(`tr${i}`)} />
      ))}
      <S name="rain_loop" at={T.fire - 6} dur={T.l3 - T.fire + 6} volume={0.35} fadeOut={6} />
      <S name="tape_stop" at={T.l3} volume={0.85} />
      <S name="paper" at={T.l3 + 16} volume={0.6} />
      <S name="highlighter" at={T.problem + 12} volume={0.7} />
      <S name="highlighter" at={T.never} volume={0.85} />
      <S name="marker_draw" at={T.happened + 2} volume={0.5} />
      <S name="stamp" at={T.happened + 16} volume={0.95} />
      {[T.l4 + 4, T.l4 + 10, T.l4 + 16].map((f) => (
        <S key={f} name="page_flip" at={f} volume={0.7} />
      ))}
      <S name="paper" at={T.l4 + 6} volume={0.6} />
      <S name="pen_scratch" at={T.blank - 14} volume={0.6} dur={22} fadeOut={6} />
      <S name="marker_draw" at={T.blank + 4} volume={0.5} />
      {new Array(10).fill(0).map((_, i) => (
        <S key={i} name="tick" at={T.four + i * 3} volume={0.45} />
      ))}
      <S name="riser" at={Math.max(0, T.zero - 72)} volume={0.5} />
      <S name="hit" at={T.zero} volume={0.95} />
      <S name="whoosh" at={T.l4end + 8} volume={0.5} />
      <S name="stamp" at={T.l4end + 30} volume={1} />
      <S name="hit" at={T.l4end + 30} volume={0.7} />

      {showSubs ? <SubtitleTrack tl={tl} /> : null}
      {draft ? <DraftBadge /> : null}
    </AbsoluteFill>
  );
};
