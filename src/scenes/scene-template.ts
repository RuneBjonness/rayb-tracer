import { SceneDefinition } from './scene-definition';
import { defaultScene } from './templates/default';

export enum SceneTemplate {
  default = 'Default Scene',
  marbles = 'Marbles',
}

export function loadSceneDefinition(template: SceneTemplate): SceneDefinition {
  switch (template) {
    case SceneTemplate.default:
      return defaultScene;

    case SceneTemplate.marbles:
      return defaultScene;

    default:
      return defaultScene;
  }
}
