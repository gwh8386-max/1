import React from 'react';
import {Composition, Still} from 'remotion';
import {Lab} from './Lab';
import {timeline as simo, SimoHayha, SimoProps} from './projects/simo-hayha/Video';
import {SimoThumb} from './projects/simo-hayha/Thumbnail';
import {SimoThumbTall} from './projects/simo-hayha/ThumbnailTall';
import {loadFonts} from './lib/fonts';
import {FPS, sec} from './lib/timeline';
import {timeline as vbb, Video as VinhBacBo, VideoProps} from './projects/vinh-bac-bo/Video';
import {timeline as tkh, TonkinHook, TonkinProps} from './projects/tonkin-hook/Video';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="VinhBacBo"
      component={VinhBacBo}
      durationInFrames={sec(vbb.duration)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{} as VideoProps}
    />
    <Composition
      id="TonkinHook"
      component={TonkinHook}
      durationInFrames={sec(tkh.duration)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{} as TonkinProps}
    />
    <Composition
      id="SimoHayha"
      component={SimoHayha}
      durationInFrames={sec(simo.duration)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{} as SimoProps}
    />
    <Still id="SimoThumb" component={SimoThumb} width={1920} height={1080} />
    <Still id="SimoThumbTall" component={SimoThumbTall} width={1080} height={1920} />
    <Composition id="Lab" component={Lab} durationInFrames={60} fps={FPS} width={1920} height={1080} />
  </>
);
