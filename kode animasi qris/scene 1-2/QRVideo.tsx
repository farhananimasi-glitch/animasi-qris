import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Background} from './Background';
import {Scene1Hook} from './Scene1Hook';
import {Scene2Binary} from './Scene2Binary';
import {Scene3FinderPattern} from './Scene3FinderPattern';
import {Scene4ReedSolomon} from './Scene4ReedSolomon';
import {Scene5NationalStandard} from './Scene5NationalStandard';
import {Scene6Outro} from './Scene6Outro';
import {SCENE1, SCENE2, SCENE3, SCENE4, SCENE5, SCENE6} from './theme';

export const QRVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Sequence from={SCENE1.from} durationInFrames={SCENE1.duration} name="Scene 1 - Hook">
        <Scene1Hook />
      </Sequence>
      <Sequence from={SCENE2.from} durationInFrames={SCENE2.duration} name="Scene 2 - Biner">
        <Scene2Binary />
      </Sequence>
      <Sequence from={SCENE3.from} durationInFrames={SCENE3.duration} name="Scene 3 - Finder Pattern">
        <Scene3FinderPattern />
      </Sequence>
      <Sequence from={SCENE4.from} durationInFrames={SCENE4.duration} name="Scene 4 - Reed-Solomon">
        <Scene4ReedSolomon />
      </Sequence>
      <Sequence from={SCENE5.from} durationInFrames={SCENE5.duration} name="Scene 5 - Standar ID Nasional">
        <Scene5NationalStandard />
      </Sequence>
      <Sequence from={SCENE6.from} durationInFrames={SCENE6.duration} name="Scene 6 - Outro & Loop">
        <Scene6Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
