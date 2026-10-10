import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../../components/Overlays';
import {SceneShell, Transition, transitionFrames} from '../../components/Shell';
import {Subtitle} from '../../components/Text';
import {FONT} from '../../lib/fonts';
import {MUSIC_GAIN} from '../../lib/mix';
import {C} from '../../lib/theme';
import {activeLine, ClockProvider, FPS, SceneClock, sec, Timeline} from '../../lib/timeline';
import data from './lines.json';
import {S01, S02, S03, S04, S05, S06, S07} from './scenes-a';
import {S08, S09, S10, S11, S12, S13, S14} from './scenes-b';

export const timeline = data as Timeline;
export const SLUG = 'vinh-bac-bo';

/** Cảnh nào dùng component nào, và chuyển cảnh để VÀO cảnh đó (theo cột "chuyển" trong kịch bản). */
const SCENES: Record<string, {C: React.FC; enter?: Transition}> = {
  C01: {C: S01},
  C02: {C: S02, enter: {type: 'zoomOut', x: 45, y: 80, dur: 24}},
  C03: {C: S03},
  C04: {C: S04, enter: {type: 'whip'}},
  C05: {C: S05},
  C06: {C: S06, enter: {type: 'flash', dur: 16}},
  C07: {C: S07, enter: {type: 'zoomThrough', x: 72, y: 58}},
  C08: {C: S08, enter: {type: 'blur'}},
  C09: {C: S09, enter: {type: 'whip', dir: -1}},
  C10: {C: S10},
  C11: {C: S11, enter: {type: 'iris'}},
  C12: {C: S12, enter: {type: 'blur', dur: 30}},
  C13: {C: S13},
  C14: {C: S14, enter: {type: 'iris', x: 50, y: 45}},
};

type Cue = {track: 'tension' | 'drums' | 'reflective'; from: string; to: string; vol: number; trim?: number; fadeIn?: number; fadeOut?: number};

/** Nhạc nền theo cảnh: căng dần, cắt hẳn ở cảnh dừng hình, trống trận khi leo thang, lắng ở đoạn kết. */
const MUSIC: Cue[] = [
  {track: 'tension', from: 'C01', to: 'C05', vol: 0.5, fadeIn: 60, fadeOut: 3},
  {track: 'tension', from: 'C06', to: 'C09', vol: 0.4, trim: 30, fadeIn: 20, fadeOut: 25},
  {track: 'drums', from: 'C09', to: 'C12', vol: 0.45, fadeIn: 10, fadeOut: 40},
  {track: 'reflective', from: 'C12', to: 'END', vol: 0.42, fadeIn: 45, fadeOut: 90},
];

const DUCK = 0.55; // nhạc giảm còn 55% khi có lời

const sceneFrame = (tl: Timeline, id: string) =>
  id === 'END' ? sec(tl.duration) : sec(tl.scenes.find((s) => s.id === id)!.start);

const voiceActive = (tl: Timeline, tSec: number) => tl.lines.some((l) => tSec >= l.start - 0.15 && tSec <= l.end + 0.25);

const MusicTrack: React.FC<{tl: Timeline; cue: Cue}> = ({tl, cue}) => {
  const from = sceneFrame(tl, cue.from);
  const to = sceneFrame(tl, cue.to);
  const len = to - from;
  return (
    <Sequence from={from} durationInFrames={len} layout="none" name={`nhạc:${cue.track}`}>
      <Audio
        src={staticFile(`music/${cue.track}.wav`)}
        loop
        trimBefore={(cue.trim ?? 0) * FPS}
        volume={(f) => {
          const t = (from + f) / FPS;
          // Ducking mượt: lấy trung bình trạng thái giọng trong ±0,2 s.
          let on = 0;
          for (const d of [-0.2, -0.1, 0, 0.1, 0.2]) {
            on += voiceActive(tl, t + d) ? 1 : 0;
          }
          const duck = 1 - (1 - DUCK) * (on / 5);
          const fi = cue.fadeIn ? interpolate(f, [0, cue.fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;
          const fo = cue.fadeOut ? interpolate(f, [len - cue.fadeOut, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
          return cue.vol * MUSIC_GAIN * duck * fi * fo;
        }}
      />
    </Sequence>
  );
};

const SubtitleTrack: React.FC<{tl: Timeline}> = ({tl}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const l = activeLine(tl, t);
  return l ? <Subtitle words={l.words} tSec={t} /> : null;
};

const DraftBadge: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 24,
      bottom: 24,
      fontFamily: FONT.body,
      fontWeight: 700,
      fontSize: 22,
      color: C.white,
      background: 'rgba(180,66,31,0.85)',
      padding: '6px 14px',
      borderRadius: 8,
    }}
  >
    BẢN NHÁP · thời lượng ước tính, chưa có giọng đọc
  </div>
);

export type VideoProps = {subtitles?: boolean};

export const Video: React.FC<VideoProps> = ({subtitles}) => {
  const tl = timeline;
  const draft = tl.source === 'estimate';
  const showSubs = subtitles ?? draft;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.scenes.map((sc, i) => {
        const spec = SCENES[sc.id];
        if (!spec) {
          throw new Error(`Chưa có component cho cảnh ${sc.id}`);
        }
        const next = tl.scenes[i + 1] ? SCENES[tl.scenes[i + 1].id] : undefined;
        const lead = i === 0 ? 0 : Math.floor(transitionFrames(spec.enter) / 2);
        const tail = next ? Math.ceil(transitionFrames(next.enter) / 2) : 0;
        const from = sec(sc.start) - lead;
        const total = sec(sc.end) - sec(sc.start) + lead + tail;
        const clock = new SceneClock(tl, sc, lead, total);
        return (
          <Sequence key={sc.id} from={from} durationInFrames={total} name={`${sc.id} ${sc.title}`}>
            <ClockProvider clock={clock}>
              <SceneShell total={total} enter={i === 0 ? undefined : spec.enter} exit={next?.enter}>
                <spec.C />
              </SceneShell>
            </ClockProvider>
          </Sequence>
        );
      })}
      <Grain opacity={0.07} />
      {!draft ? <Audio src={staticFile(`projects/${SLUG}/voice.wav`)} volume={1} /> : null}
      {MUSIC.map((cue, i) => (
        <MusicTrack key={i} tl={tl} cue={cue} />
      ))}
      {showSubs ? <SubtitleTrack tl={tl} /> : null}
      {draft ? <DraftBadge /> : null}
    </AbsoluteFill>
  );
};
