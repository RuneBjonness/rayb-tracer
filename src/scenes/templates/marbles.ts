import { SceneDefinition } from '../scene-definition';
import { MATERIAL_GLASS, MATERIAL_SHINY } from './helpers/materials';
import { primitiveSphere } from './helpers/shapes';

export function marbleScene(options: {
  lightShape: 'round' | 'rectangular';
}): SceneDefinition {
  const scene: SceneDefinition = {
    name: `Marbles (${options.lightShape} light source)`,
    camera: {
      fieldOfView: 60,
      viewTransform: {
        from: [0, 1.3, -5],
        to: [0, 0.5, 0],
        up: [0, 1, 0],
      },
      aperture: 0.04,
      focalDistance: 5,
    },
    world: {
      ambientLight: 0.025,
      lights: [
        {
          type: 'area',
          intensity: [1.5, 1.5, 1.5],
          transform: [
            ['scale', 2, 2, 2],
            ['translate', -5, 6, -3],
          ],
          includeGeometry: options.lightShape === 'rectangular',
        },
      ],
      objects: [
        {
          type: { type: 'plane' },
          material: {
            color: [1, 1, 1],
            diffuse: 0.67,
            specular: 0,
            reflective: 0.2,
          },
        },
        primitiveSphere(0.3, 0.4, 0.7, ['glass', [0.1, 0, 0.2]]),

        primitiveSphere(-1.2, 0.2, 0.5, ['shiny', [0.5, 0, 1]]),
        primitiveSphere(-2.5, 2, 0.75, ['shiny', [0.6, 0.2, 1]]),
        primitiveSphere(1.9, 6, 0.5, ['shiny', [0.6, 0.3, 1]]),
        primitiveSphere(1.3, -2.5, 0.8, ['shiny', [0.7, 0.3, 0.9]]),
        primitiveSphere(-0.4, -1.5, 0.3, ['shiny', [0.8, 0.3, 0.9]]),
        primitiveSphere(-1, 7, 0.5, ['shiny', [0.8, 0.3, 0.8]]),
        primitiveSphere(0.3, -1.1, 0.3, ['shiny', [0.9, 0.3, 0.8]]),
        primitiveSphere(-1.4, -1.5, 0.5, ['shiny', [1, 0.4, 0.8]]),
        primitiveSphere(-1.1, 4, 0.5, ['shiny', [1, 0.5, 0.9]]),
        primitiveSphere(-3, 11, 0.5, ['shiny', [1, 0.6, 1]]),
      ],
    },
    materials: {
      shiny: MATERIAL_SHINY,
      glass: MATERIAL_GLASS,
    },
  };

  if (options.lightShape === 'round') {
    scene.world.objects!.push({
      type: { type: 'sphere' },
      transform: [
        ['scale', 1.75, 1.75, 1.75],
        ['translate', -7, 8, -5],
      ],
      material: {
        color: [1.5, 1.5, 1.5],
        diffuse: 0,
        specular: 0,
        ambient: 1,
      },
    });
  }

  return scene;
}
