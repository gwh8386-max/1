import React from 'react';
import {AbsoluteFill, Freeze, interpolate, random, useCurrentFrame} from 'remotion';
import {Character} from '../../components/Character';
import {CircleInset} from '../../components/CircleInset';
import {StrikeText} from '../../components/StrikeText';
import {Camera} from '../../components/Camera';
import {FlashAt, Grain, lerp, Rain, Vignette} from '../../components/Overlays';
import {Sfx} from '../../components/Sfx';
import {Counter, DateStamp, PunchText} from '../../components/Text';
import {H, W} from '../../art/common';
import {CICRoom} from '../../art/Interior';
import {geo, geoPct, GulfMap} from '../../art/Map';
import {Blip, Radar, sweepHits} from '../../art/Radar';
import {DaySea, Destroyer, NightSea, TorpedoBoat, Tracer} from '../../art/Sea';
import {C} from '../../lib/theme';
import {useClock} from '../../lib/timeline';

const RADAR_BLIPS: Blip[] = [
  {theta: 50, r0: 410, r1: 250},
  {theta: 63, r0: 380, r1: 215},
  {theta: 44, r0: 430, r1: 300, size: 0.8},
];

// ---------------------------------------------------------------- C01
export const S01: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const blips = RADAR_BLIPS.map((b) => ({...b, from: 0, to: c.total}));
  const beeps = sweepHits(52, 2.4, 30, 0, c.total);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: lerp(frame, 6, 22, 0, 1)}}>
        <Camera zoom={[1, 1.22]} x={57} y={40} duration={c.total} handheld={0.4}>
          <Radar blips={blips} />
        </Camera>
      </AbsoluteFill>
      <Vignette strength={0.75} />
      <DateStamp text="4/8/1964 · VỊNH BẮC BỘ" at={c.at('L01')} />
      <Sfx name="radar_beep" at={1} volume={0.55} />
      {beeps.map((f) => (
        <Sfx key={f} name="radar_beep" at={f} volume={0.45} />
      ))}
      <Sfx name="sea_loop" at={0} dur={c.total} volume={0.3} fadeIn={30} />
      <Sfx name="wind_loop" at={0} dur={c.total} volume={0.22} fadeIn={30} />
      <Sfx name="room_hum_loop" at={0} dur={c.total} volume={0.25} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C02
export const S02: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const bolt = c.at('L03', 'biển', 0.1);
  const lightning = (() => {
    const k = (frame - bolt) / 12;
    return k < 0 || k > 1 ? 0 : k < 0.2 ? 1 : k < 0.35 ? 0.2 : 0.9 * (1 - k);
  })();
  const l04 = c.at('L04');
  const inset = c.at('L04', 'tin');
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.08]} x={45} y={60} duration={c.total} handheld={0.7}>
        <CICRoom
          lightning={lightning}
          behind={
            <>
              <Character x={700} y={1010} scale={1.25} outfit="sailor" hat="headset" expr="worried" sweat look={[0.4, 0.8]} armL={{a: 25}} armR={{a: 40, bend: -0.3}} seed={11} />
              <Character x={1040} y={1010} scale={1.25} outfit="sailor" hat="headset" expr="worried" sweat look={[-0.4, 0.8]} armL={{a: 40, bend: -0.3}} armR={{a: 20}} seed={12} />
            </>
          }
        >
          <Character
            x={330}
            y={1090}
            scale={1.35}
            outfit="officer"
            hat="officer"
            expr={frame < l04 ? 'stern' : 'worried'}
            look={frame < l04 ? [0.8, 0.6] : [1, 0]}
            armL={{a: 15}}
            armR={{a: 70, bend: 0.5}}
            seed={13}
          />
        </CICRoom>
      </Camera>
      <Vignette strength={0.6} />
      <CircleInset at={inset} x={1500} y={330} r={230} zoom={0.55} tail={[1090, 640]}>
        <Radar blips={RADAR_BLIPS.map((b) => ({...b, from: 0, to: c.total}))} />
      </CircleInset>
      <Sfx name="rain_loop" at={0} dur={c.total} volume={0.45} fadeIn={10} />
      <Sfx name="room_hum_loop" at={0} dur={c.total} volume={0.3} />
      <Sfx name="thunder" at={bolt + 6} volume={0.75} />
      <Sfx name="pop" at={inset} volume={0.7} />
      <Sfx name="radar_beep" at={inset + 4} volume={0.45} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C03
const Torpedo: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const frame = useCurrentFrame();
  if (frame < at) {
    return null;
  }
  const k = lerp(frame, at, at + 8, 0, 1);
  return (
    <g transform={`translate(${x + (1 - k) * 300} ${y}) scale(${0.6 + 0.4 * k})`} opacity={k}>
      <path d="M -120 -22 L 90 -22 Q 130 0 90 22 L -120 22 Z" fill={C.steelLight} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -120 -22 L -150 -40 L -150 40 L -120 22" fill={C.steel} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -30 -22 L -30 22 M 20 -22 L 20 22" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

export const S03: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const shout = c.at('L05', 'ngư');
  const hits = [c.at('L06', 0), c.at('L06', 2), c.at('L06', 6)];
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <Camera zoom={[1.02, 1.1]} x={40} y={45} duration={c.total} shakes={[{at: shout, amp: 30, dur: 18}, ...hits.map((h) => ({at: h, amp: 10, dur: 8}))]} handheld={1}>
        <AbsoluteFill style={{filter: 'blur(9px) brightness(0.7)', transform: 'scale(1.35)'}}>
          <CICRoom redAlert={frame >= shout ? 1 : 0} />
        </AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Character
            x={700}
            y={1150}
            scale={2.6}
            outfit="sailor"
            hat="headset"
            expr={frame < shout ? 'focused' : 'shout'}
            talk={frame >= shout && frame < shout + 20}
            tremble={frame >= shout ? 1 : 0.2}
            sweat
            armL={{a: 20}}
            armR={{a: 150, bend: -0.5, len: 80}}
            seed={21}
          />
          {hits.map((h, i) => (
            <Torpedo key={i} x={1460} y={560 + i * 120} at={h} />
          ))}
        </svg>
        {frame >= shout ? <AbsoluteFill style={{background: `rgba(255,30,20,${0.1 + 0.1 * Math.max(0, Math.sin(frame / 3))})`}} /> : null}
      </Camera>
      <PunchText text="NGƯ LÔI!" at={shout} x={1430} y={300} size={210} color={C.mustard} rotate={-6} />
      {hits.map((h, i) => (
        <Counter key={i} from={i} to={i + 1} start={h} end={h + 4} x={1780} y={560 + i * 120} size={96} color={C.white} />
      ))}
      <Vignette strength={0.6} color="40,0,0" />
      <Sfx name="sonar_ping" at={2} volume={0.45} />
      <Sfx name="alarm" at={shout} volume={0.55} />
      <Sfx name="hit" at={shout} volume={0.9} />
      {hits.map((h) => (
        <Sfx key={h} name="hit" at={h} volume={0.55} />
      ))}
      <Sfx name="room_hum_loop" at={0} dur={c.total} volume={0.25} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C04 / C05
/** Cảnh hai tàu bắn vào bóng tối; tách riêng để cảnh 5 dừng hình được. */
const Firing: React.FC<{shots: number[]}> = ({shots}) => {
  const frame = useCurrentFrame();
  const flashLevel = shots.reduce((m, s) => {
    const k = (frame - s) / 8;
    return k >= 0 && k <= 1 ? Math.max(m, 1 - k) : m;
  }, 0);
  return (
    <AbsoluteFill>
      <NightSea horizon={600} flash={flashLevel}>
        <Destroyer x={1180} y={620} s={0.5} flashes={shots.filter((_, i) => i % 3 === 2)} />
        <Destroyer x={640} y={760} s={0.95} flashes={shots.filter((_, i) => i % 3 !== 2)} />
        {shots.map((s, i) => (
          <Tracer key={i} x0={i % 3 === 2 ? 1350 : 960} y0={i % 3 === 2 ? 570 : 650} x1={1950 + random(`tx${i}`) * 200} y1={420 + random(`ty${i}`) * 160} at={s + 1} />
        ))}
      </NightSea>
      <Rain count={160} opacity={0.45} />
    </AbsoluteFill>
  );
};

const firingShots = (total: number) => {
  const out: number[] = [];
  let f = 6;
  let i = 0;
  while (f < total + 40) {
    out.push(Math.round(f));
    f += 9 + random(`shot${i++}`) * 14;
  }
  return out;
};

export const S04: React.FC = () => {
  const c = useClock();
  const shots = firingShots(c.total);
  return (
    <AbsoluteFill>
      <Camera zoom={[1.05, 1.12]} x={50} y={55} duration={c.total} shakes={shots.map((s) => ({at: s, amp: 9, dur: 8}))} handheld={1}>
        <Firing shots={shots} />
      </Camera>
      <Vignette strength={0.7} />
      {shots.map((s, i) => (
        <Sfx key={s} name="cannon" at={s} volume={0.42 + 0.25 * random(`v${i}`)} rate={0.9 + 0.2 * random(`r${i}`)} />
      ))}
      <Sfx name="rain_loop" at={0} dur={c.total} volume={0.4} />
      <Sfx name="sea_loop" at={0} dur={c.total} volume={0.35} />
    </AbsoluteFill>
  );
};

export const S05: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  // Khung hình đứng lại đúng lúc vừa có một phát bắn (để còn thấy loé lửa).
  const shots = firingShots(400);
  const freezeAt = shots.find((s) => s > 60) ?? 60;
  const gray = lerp(frame, 0, 10, 0, 1);
  const look = c.at('L09');
  const circle = lerp(frame, look + 10, look + 30, 0, 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Camera zoom={[1.12, 1.12]} snaps={[{at: look, to: 1.3, x: 84, y: 54}]} handheld={0} duration={c.total}>
        <AbsoluteFill style={{filter: `grayscale(${gray}) contrast(${1 + 0.15 * gray}) brightness(${1 - 0.12 * gray})`}}>
          <Freeze frame={freezeAt + 1}>
            <Firing shots={shots} />
          </Freeze>
        </AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          {circle > 0 ? (
            <g>
              <circle cx={1640} cy={600} r={150} fill="none" stroke={C.blood} strokeWidth={12} strokeDasharray={`${circle * 945} 945`} strokeLinecap="round" transform="rotate(-90 1640 600)" />
              <text x={1640} y={652} textAnchor="middle" fontFamily="Anton" fontSize={170} fill={C.blood} opacity={circle}>
                ?
              </text>
            </g>
          ) : null}
        </svg>
      </Camera>
      <PunchText text="CHỈ CÓ MỘT VẤN ĐỀ NHỎ" at={c.at('L08', 1)} out={look - 4} x={W / 2} y={190} size={120} color={C.mustard} rotate={-2} />
      <Vignette strength={0.8} />
      <Sfx name="tape_stop" at={0} volume={0.8} />
      <Sfx name="sea_loop" at={0} dur={c.total} volume={0.35} fadeIn={20} />
      <Sfx name="hit" at={look + 10} volume={0.4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C06
/** Trận đụng độ ban ngày 2/8, hiện trong ô tròn trên bản đồ rồi nở ra toàn khung. */
const DayBattle: React.FC<{clash: number}> = ({clash}) => {
  const frame = useCurrentFrame();
  const boatX = (i: number) => interpolate(frame, [clash - 60, clash + 90], [760 - i * 90, 1200 - i * 80]);
  return (
    <AbsoluteFill style={{filter: 'sepia(0.35) saturate(0.9)'}}>
      <DaySea horizon={600}>
        <Destroyer x={1390} y={690} s={0.75} lit={false} rock={0.6} flashes={frame > clash ? [clash + 4, clash + 18, clash + 34] : []} />
        <TorpedoBoat x={boatX(0)} y={760} s={0.9} />
        <TorpedoBoat x={boatX(1)} y={700} s={0.7} />
        <TorpedoBoat x={boatX(2)} y={830} s={1} />
        {frame > clash
          ? new Array(8).fill(0).map((_, i) => {
              const at = clash + i * 6;
              const k = (frame - at) / 14;
              if (k < 0 || k > 1) {
                return null;
              }
              return <ellipse key={i} cx={1100 + random(`sp${i}`) * 300} cy={760 + random(`spy${i}`) * 80} rx={10 + 18 * k} ry={30 * (1 - k)} fill="#ffffff" opacity={1 - k} />;
            })
          : null}
      </DaySea>
    </AbsoluteFill>
  );
};

export const S06: React.FC = () => {
  const c = useClock();
  const routeFrom = c.at('L10') + 4;
  const named = c.at('L11', 'maddox');
  const clash = c.at('L11', 'đụng');
  const three = c.at('L11', 'ba');
  const expandAt = c.end('L11') - 4;
  const [hx, hy] = geoPct(106.2, 19.45);
  const [bx, by] = geo(106.31, 19.44);
  const zoomAt = c.at('L11');
  // Toạ độ điểm đụng độ trên màn hình sau khi máy quay zoom (để nối bong bóng của ô tròn).
  const z = 1.85;
  const ox = (hx / 100) * W;
  const oy = (hy / 100) * H;
  const tail: [number, number] = [ox + (bx - ox) * z, oy + (by - oy) * z];
  return (
    <AbsoluteFill>
      <Camera zoom={[1, 1.03]} x={hx} y={hy} duration={c.total} snaps={[{at: zoomAt, to: 1.8, x: hx, y: hy}]} shakes={[{at: clash + 12, amp: 10, dur: 14}]} handheld={0.2}>
        <AbsoluteFill style={{filter: 'sepia(0.25)'}}>
          <GulfMap
            arrows={[
              {pts: [[107.9, 17.3], [107.3, 18.0], [106.75, 18.65], [106.45, 19.05], [106.38, 19.36]], from: routeFrom, to: named, color: C.navyDark, width: 10, label: 'USS MADDOX', labelAt: named},
              {pts: [[105.86, 19.62], [106.05, 19.56], [106.24, 19.5]], from: clash - 12, to: clash + 8, color: C.blood, width: 7},
              {pts: [[105.84, 19.44], [106.04, 19.45], [106.23, 19.46]], from: clash - 9, to: clash + 10, color: C.blood, width: 7},
              {pts: [[105.88, 19.24], [106.06, 19.32], [106.24, 19.42]], from: clash - 6, to: clash + 12, color: C.blood, width: 7},
            ]}
            markers={[
              {ll: [105.92, 19.37], at: zoomAt + 4, kind: 'dot', color: C.ink, label: 'HÒN MÊ', labelSide: 'left', size: 0.7},
              {ll: [106.31, 19.44], at: clash + 12, kind: 'burst', size: 0.5},
            ]}
          />
        </AbsoluteFill>
      </Camera>
      <CircleInset at={three} x={1420} y={430} r={280} fx={1100} fy={700} zoom={0.8} tail={tail} expandAt={expandAt}>
        <DayBattle clash={three} />
      </CircleInset>
      <Grain opacity={0.16} />
      <Vignette strength={0.45} color="60,40,10" />
      <DateStamp text="2/8/1964 · HAI NGÀY TRƯỚC" at={8} />
      <Sfx name="flash" at={0} volume={0.7} />
      <Sfx name="rewind" at={0} volume={0.55} />
      <Sfx name="marker_draw" at={routeFrom} volume={0.55} />
      <Sfx name="marker_draw" at={routeFrom + 45} volume={0.5} />
      <Sfx name="whoosh_short" at={zoomAt} volume={0.5} />
      <Sfx name="whoosh_short" at={clash - 10} volume={0.55} />
      <Sfx name="hit" at={clash + 12} volume={0.75} />
      <Sfx name="pop" at={three} volume={0.7} />
      <Sfx name="boat_engine" at={three} volume={0.5} />
      <Sfx name="machinegun_far" at={three + 4} volume={0.6} />
      <Sfx name="cannon" at={three + 18} volume={0.45} />
      <Sfx name="whoosh" at={expandAt - 4} volume={0.6} />
      <Sfx name="sea_loop" at={three} dur={Math.max(1, c.total - three)} volume={0.3} fadeIn={10} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C07
export const S07: React.FC = () => {
  const c = useClock();
  const frame = useCurrentFrame();
  const morph = c.at('L13', 'hóa');
  const blips: Blip[] = new Array(7).fill(0).map((_, i) => ({
    theta: 20 + random(`b7${i}`) * 140,
    r0: 180 + random(`r7${i}`) * 220,
    r1: 120 + random(`q7${i}`) * 200,
    from: Math.round(random(`f7${i}`) * 40),
    to: c.total,
    size: 0.7 + random(`s7${i}`) * 0.5,
  }));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Camera zoom={[1.3, 1.55]} x={56} y={44} duration={c.total} snaps={[{at: morph, to: 1.08}]} handheld={0.8}>
        <Radar blips={blips} noise={0.9} morphAt={morph} />
      </Camera>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(120,0,0,0) 45%, rgba(120,0,0,${lerp(frame, morph - 20, morph + 20, 0.2, 0.65)}) 100%)`}} />
      <StrikeText text="ĐỐM NHIỄU" at={c.at('L13', 'đốm')} strikeAt={morph} replace="TÀU ĐỊCH" replaceAt={c.at('L13', 'tàu')} replaceColor="#ff5a4a" x={W / 2} y={170} size={104} />
      <Sfx name="pop" at={c.at('L13', 'đốm')} volume={0.6} />
      <Sfx name="scribble" at={morph} volume={0.85} />
      <Sfx name="heartbeat" at={c.at('L12')} volume={0.7} />
      <Sfx name="heartbeat" at={c.at('L12') + 120} volume={0.8} />
      <Sfx name="radio_static" at={0} volume={0.35} />
      <Sfx name="radio_static" at={85} volume={0.3} />
      <Sfx name="riser" at={morph - 70} volume={0.45} />
      <Sfx name="hit" at={morph} volume={0.7} />
      <Sfx name="room_hum_loop" at={0} dur={c.total} volume={0.2} />
    </AbsoluteFill>
  );
};
