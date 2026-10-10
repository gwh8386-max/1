import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../lib/fonts';
import {MUSIC_GAIN} from '../lib/mix';
import {C} from '../lib/theme';
import {activeLine, FPS, Timeline} from '../lib/timeline';
import {Subtitle} from './Text';

export const DUCK = 0.55; // nhạc giảm còn 55% khi có lời

export const voiceActive = (tl: Timeline, tSec: number) => tl.lines.some((l) => tSec >= l.start - 0.15 && tSec <= l.end + 0.25);

/** Một đoạn nhạc nền từ frame `from` tới `to`, tự hạ khi có lời (ducking), có fade vào/ra. */
export const MusicBed: React.FC<{
  tl: Timeline;
  track: 'tension' | 'drums' | 'reflective';
  from: number;
  to: number;
  vol: number;
  trim?: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({tl, track, from, to, vol, trim = 0, fadeIn = 0, fadeOut = 0}) => {
  const len = Math.max(1, to - from);
  return (
    <Sequence from={from} durationInFrames={len} layout="none" name={`nhạc:${track}`}>
      <Audio
        src={staticFile(`music/${track}.wav`)}
        loop
        trimBefore={trim * FPS}
        volume={(f) => {
          const t = (from + f) / FPS;
          let on = 0;
          for (const d of [-0.2, -0.1, 0, 0.1, 0.2]) {
            on += voiceActive(tl, t + d) ? 1 : 0;
          }
          const duck = 1 - (1 - DUCK) * (on / 5);
          const fi = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;
          const fo = fadeOut ? interpolate(f, [len - fadeOut, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
          return vol * MUSIC_GAIN * duck * fi * fo;
        }}
      />
    </Sequence>
  );
};

export const SubtitleTrack: React.FC<{tl: Timeline}> = ({tl}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const l = activeLine(tl, t);
  return l ? <Subtitle words={l.words} tSec={t} /> : null;
};

export const DraftBadge: React.FC = () => (
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
