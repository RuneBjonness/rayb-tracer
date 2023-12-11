import { RenderConfiguration } from '../renderer/configuration';
import { ImageMapping } from './fixed/image-mapping';
import { Skybox } from './fixed/skybox';
import { TeaPot } from './fixed/teapot';
import { MarbleMadness } from './fixed/marble-madness';
import { MarbleMadness2 } from './fixed/marble-madness-2';
import { Scene } from './scene';
import { Dragon } from './fixed/dragon';

export enum ScenePreset {
  dragon = 'Dragon',
  teapot = 'Teapot [high-res]',
  teapotLow = 'Teapot [low-res]',
  skybox = 'Skybox',
  imageMapping = 'Image mapping',
  marbleMadness = 'Marble madness',
  marbleMadness2 = 'Marble madness 2',
}

export function loadScene(
  preset: ScenePreset,
  renderCfg: RenderConfiguration
): Scene {
  switch (preset) {
    case ScenePreset.dragon:
      return new Dragon(renderCfg);

    case ScenePreset.imageMapping:
      return new ImageMapping(renderCfg);

    case ScenePreset.skybox:
      return new Skybox(renderCfg);

    case ScenePreset.teapot:
      return new TeaPot(renderCfg, true);

    case ScenePreset.teapotLow:
      return new TeaPot(renderCfg, false);

    case ScenePreset.marbleMadness:
      return new MarbleMadness(renderCfg);

    case ScenePreset.marbleMadness2:
      return new MarbleMadness2(renderCfg);
  }
}
