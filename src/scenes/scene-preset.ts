import { RenderConfiguration } from '../renderer/configuration';
import { ImageMapping } from './fixed/image-mapping';
import { Patterns } from './fixed/patterns';
import { Skybox } from './fixed/skybox';
import { TeaPot } from './fixed/teapot';
import { TextureMapping } from './fixed/texture-mapping';
import { MarbleMadness } from './fixed/marble-madness';
import { MarbleMadness2 } from './fixed/marble-madness-2';
import { Scene } from './scene';

export enum ScenePreset {
  teapot = 'Teapot [high-res]',
  teapotLow = 'Teapot [low-res]',
  textureMapping = 'Texture mapping',
  skybox = 'Skybox',
  imageMapping = 'Image mapping',
  patterns = '3D Patterns',
  marbleMadness = 'Marble madness',
  marbleMadness2 = 'Marble madness 2',
}

export function loadScene(
  preset: ScenePreset,
  renderCfg: RenderConfiguration
): Scene {
  switch (preset) {
    case ScenePreset.imageMapping:
      return new ImageMapping(renderCfg);

    case ScenePreset.patterns:
      return new Patterns(renderCfg);

    case ScenePreset.skybox:
      return new Skybox(renderCfg);

    case ScenePreset.teapot:
      return new TeaPot(renderCfg, true);

    case ScenePreset.teapotLow:
      return new TeaPot(renderCfg, false);

    case ScenePreset.textureMapping:
      return new TextureMapping(renderCfg);

    case ScenePreset.marbleMadness:
      return new MarbleMadness(renderCfg);

    case ScenePreset.marbleMadness2:
      return new MarbleMadness2(renderCfg);
  }
}
