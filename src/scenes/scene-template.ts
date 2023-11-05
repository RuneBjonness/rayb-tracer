import { SceneDefinition } from './scene-definition';
import { defaultScene } from './templates/default';
import { marbleScene } from './templates/marbles';

export enum SceneTemplate {
  default = 'Default Scene',
  marbles = 'Marbles',
}

export function loadSceneDefinition(template: SceneTemplate): SceneDefinition {
  switch (template) {
    case SceneTemplate.default:
      return defaultScene;

    case SceneTemplate.marbles:
      return marbleScene();

    default:
      return defaultScene;
  }
}
