import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DraftBadge, MusicBed, SubtitleTrack} from '../../components/Mix';
import {Grain, Vignette} from '../../components/Overlays';
import {Dust, LightLeak, Spotlight} from '../../vox/atmos';
import {Board1, Board1Sfx} from './board1';
import {Board2, Board2Sfx} from './board2';
import {Board3, Board3Sfx} from './board3';
import {Board4, Board4Sfx} from './board4';
import {Board5, Board5Sfx} from './board5';
import {Board6, Board6Sfx, TitleCard} from './board6';
import {BOARDS, c, SLUG, TOTAL, tl} from './clock';
import {Only, S} from './kit';

export const timeline = tl;

// Đổi bảng: loé trắng như tuyết hắt vào ống kính, che chỗ cắt.
const SnowCut: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at - 6, at, at + 10], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (k <= 0) {
    return null;
  }
  return <AbsoluteFill style={{background: `rgba(244,248,252,${k})`, pointerEvents: 'none'}} />;
};

const LIST: {range: readonly [number, number]; C: React.FC; Sfx: React.FC}[] = [
  {range: BOARDS.b1, C: Board1, Sfx: Board1Sfx},
  {range: BOARDS.b2, C: Board2, Sfx: Board2Sfx},
  {range: BOARDS.b3, C: Board3, Sfx: Board3Sfx},
  {range: BOARDS.b4, C: Board4, Sfx: Board4Sfx},
  {range: BOARDS.b5, C: Board5, Sfx: Board5Sfx},
  {range: BOARDS.b6, C: Board6, Sfx: Board6Sfx},
];

export type SimoProps = {subtitles?: boolean};

export const SimoHayha: React.FC<SimoProps> = ({subtitles}) => {
  const draft = tl.source === 'estimate';
  const showSubs = subtitles ?? draft;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {LIST.map(({range, C}, i) => (
        <Only key={i} from={range[0] - 2} to={range[1] + 1}>
          <C />
        </Only>
      ))}
      <Spotlight on={4} />
      <LightLeak opacity={0.16} />
      <Dust />
      <Vignette strength={0.55} />
      <Grain opacity={0.09} />
      <TitleCard />
      {LIST.slice(1).map(({range}) => (
        <SnowCut key={range[0]} at={range[0]} />
      ))}

      {/* Âm thanh */}
      {!draft ? <Audio src={staticFile(`projects/${SLUG}/voice.wav`)} /> : null}
      <MusicBed tl={tl} track="tension" from={0} to={BOARDS.b1[1]} vol={0.3} fadeIn={30} fadeOut={20} />
      <MusicBed tl={tl} track="reflective" from={BOARDS.b2[0]} to={c.at('L15') - 6} vol={0.26} fadeIn={20} fadeOut={10} />
      <MusicBed tl={tl} track="drums" from={c.at('L15') - 6} to={BOARDS.b2[1]} vol={0.3} fadeIn={4} fadeOut={20} />
      <MusicBed tl={tl} track="tension" from={BOARDS.b3[0]} to={c.at('L28')} vol={0.28} fadeIn={20} fadeOut={30} trim={20} />
      <MusicBed tl={tl} track="reflective" from={BOARDS.b4[0]} to={c.at('L43') - 10} vol={0.24} fadeIn={30} fadeOut={20} trim={15} />
      <MusicBed tl={tl} track="drums" from={c.at('L43') - 10} to={BOARDS.b4[1]} vol={0.28} fadeIn={10} fadeOut={30} trim={10} />
      <MusicBed tl={tl} track="tension" from={BOARDS.b5[0]} to={BOARDS.b5[1]} vol={0.24} fadeIn={30} fadeOut={30} trim={40} />
      <MusicBed tl={tl} track="reflective" from={BOARDS.b6[0]} to={TOTAL} vol={0.28} fadeIn={40} fadeOut={40} trim={30} />
      <S name="room_hum_loop" at={0} dur={TOTAL} volume={0.18} fadeIn={10} />
      {LIST.map(({Sfx}, i) => (
        <Sfx key={i} />
      ))}
      {LIST.slice(1).map(({range}) => (
        <S key={range[0]} name="whoosh" at={range[0] - 10} volume={0.6} />
      ))}

      {showSubs ? <SubtitleTrack tl={tl} /> : null}
      {draft ? <DraftBadge /> : null}
    </AbsoluteFill>
  );
};
