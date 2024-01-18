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
  marbleMadness25bruteForce = 'Marble madness: 25³ Brute force',
  marbleMadness25bvh = 'Marble madness: 25³ BVH acceleration',
  marbleMadness100bvh = 'Marble madness: 100³ BVH acceleration',
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

    case ScenePreset.marbleMadness25bruteForce:
      return new MarbleMadness(renderCfg, 25, false);

    case ScenePreset.marbleMadness25bvh:
      return new MarbleMadness(renderCfg, 25, true);

    case ScenePreset.marbleMadness100bvh:
      return new MarbleMadness(renderCfg, 100, true);
  }
}
