import { SceneDefinition } from './scene-definition';
import { defaultScene } from './templates/default';
import { marbleScene } from './templates/marbles';

export enum SceneTemplate {
  default = 'Default Scene',
  marblesRoundLight = 'Marbles (round light source)',
  marblesRectangularLight = 'Marbles (rectangular light source)',
}

export function loadSceneDefinition(template: SceneTemplate): SceneDefinition {
  switch (template) {
    case SceneTemplate.default:
      return defaultScene;

    case SceneTemplate.marblesRoundLight:
      return marbleScene({ lightShape: 'round' });

    case SceneTemplate.marblesRectangularLight:
      return marbleScene({ lightShape: 'rectangular' });

    default:
      return defaultScene;
  }
}
