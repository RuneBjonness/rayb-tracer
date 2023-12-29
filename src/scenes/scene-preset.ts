import { RenderConfiguration } from '../renderer/configuration';
import { ImageMapping } from './fixed/image-mapping';
import { Skybox } from './fixed/skybox';
import { TeaPot } from './fixed/teapot';
import { MarbleMadness } from './fixed/marble-madness';
import { Scene } from './scene';
import { Dragon } from './fixed/dragon';

export enum ScenePreset {
  dragon = 'Dragon',
  teapot = 'Teapot',
  skybox = 'Skybox',
  imageMapping = 'Image mapping',
  marbleMadness = 'Marble madness',
}

export async function loadScene(
  preset: ScenePreset,
  renderCfg: RenderConfiguration
): Promise<Scene> {
  switch (preset) {
    case ScenePreset.dragon:
      return new Dragon(renderCfg);

    case ScenePreset.imageMapping:
      const scene = new ImageMapping(renderCfg);
      await scene.configureWorld(renderCfg);
      return scene;

    case ScenePreset.skybox:
      return new Skybox(renderCfg);

    case ScenePreset.teapot:
      return new TeaPot(renderCfg);

    case ScenePreset.marbleMadness:
      return new MarbleMadness(renderCfg);
  }
}
