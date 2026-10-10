import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import manifest from '../lib/sfx-manifest.json';
import {SFX_GAIN} from '../lib/mix';
import {FPS} from '../lib/timeline';

export type SfxName = keyof typeof manifest;

/**
 * Một tiếng hiệu ứng tại frame `at` (frame cục bộ của cảnh).
 * Âm thanh lặp (rain_loop, sea_loop...) thì truyền `dur` và có thể fade vào/ra.
 */
export const Sfx: React.FC<{
  name: SfxName;
  at: number;
  volume?: number;
  dur?: number;
  fadeIn?: number;
  fadeOut?: number;
  rate?: number;
}> = ({name, at, volume = 0.8, dur, fadeIn = 0, fadeOut = 0, rate = 1}) => {
  const item = manifest[name];
  const len = dur ?? Math.ceil((item.duration / rate) * FPS) + 1;
  if (len <= 0) {
    return null;
  }
  const vol = (f: number) => {
    let v = volume * SFX_GAIN;
    if (fadeIn) {
      v *= interpolate(f, [0, fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    }
    if (fadeOut) {
      v *= interpolate(f, [len - fadeOut, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    }
    return v;
  };
  return (
    <Sequence from={Math.round(at)} durationInFrames={len} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(item.file)} volume={vol} loop={item.loop} playbackRate={rate} />
    </Sequence>
  );
};
