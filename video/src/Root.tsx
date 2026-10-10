import React from 'react';
import {Composition} from 'remotion';
import {Lab} from './Lab';
import {loadFonts} from './lib/fonts';
import {FPS, sec} from './lib/timeline';
import {timeline as vbb, Video as VinhBacBo, VideoProps} from './projects/vinh-bac-bo/Video';

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
    <Composition id="Lab" component={Lab} durationInFrames={60} fps={FPS} width={1920} height={1080} />
  </>
);
