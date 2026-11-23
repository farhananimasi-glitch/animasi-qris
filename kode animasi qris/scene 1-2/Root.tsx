import React from 'react';
import {Composition} from 'remotion';
import {QRVideo} from './QRVideo';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="QRVideo"
      component={QRVideo}
      durationInFrames={TOTAL_FRAMES} // 540 frame = 18 detik @30fps
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
