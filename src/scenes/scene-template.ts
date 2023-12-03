import { SceneDefinition } from './scene-definition';
import {
  cornellBoxMatteDiffuseScene,
  cornellBoxTransparencyScene,
} from './templates/cornell-box-scenes';
import { CsgRbScene } from './templates/csg-rb';
import { defaultScene } from './templates/default';
import { dodecahedronScene } from './templates/dodecahedron';
import { marbleScene } from './templates/marbles';
import { materialComparisonScene } from './templates/material-comparison';
import { patternsScene } from './templates/patterns';

export enum SceneTemplate {
  default = 'Default Scene',
  csgRayBTracer = 'RayB Tracer (Constructive Solid Geometry)',
  dodecahedron = 'Dodecahedron',
  marblesRoundLight = 'Marbles (round light source)',
  marblesRectangularLight = 'Marbles (rectangular light source)',
  materialComparison = 'Material Comparison',
  cornellBoxTransparency = 'Cornell Box: Transparency',
  cornellBoxMatteDiffuse = 'Cornell Box: Matte Diffuse',
  patterns = '3D Patterns',
}

export function loadSceneDefinition(template: SceneTemplate): SceneDefinition {
  switch (template) {
    case SceneTemplate.default:
      return defaultScene;

    case SceneTemplate.csgRayBTracer:
      return CsgRbScene;

    case SceneTemplate.dodecahedron:
      return dodecahedronScene;

    case SceneTemplate.marblesRoundLight:
      return marbleScene({ lightShape: 'round' });

    case SceneTemplate.marblesRectangularLight:
      return marbleScene({ lightShape: 'rectangular' });

    case SceneTemplate.materialComparison:
      return materialComparisonScene;

    case SceneTemplate.cornellBoxTransparency:
      return cornellBoxTransparencyScene;

    case SceneTemplate.cornellBoxMatteDiffuse:
      return cornellBoxMatteDiffuseScene;

    case SceneTemplate.patterns:
      return patternsScene;

    default:
      return defaultScene;
  }
}
