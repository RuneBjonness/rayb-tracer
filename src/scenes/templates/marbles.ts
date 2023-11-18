import { SceneDefinition } from '../scene-definition';
import { glassSphere, shinySphere } from './helpers/shapes';

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
      lights: [
        {
          type: 'area',
          intensity: [1.5, 1.5, 1.5],
          transform: [
            ['translate', -5, 6, -3],
            ['scale', 2, 2, 2],
          ],
          includeGeometry: options.lightShape === 'rectangular',
        },
      ],
      objects: [
        {
          primitive: { type: 'plane' },
          material: {
            color: [1, 1, 1],
            ambient: 0.025,
            diffuse: 0.67,
            specular: 0,
            reflective: 0.2,
          },
        },
        glassSphere([0.1, 0, 0.2], 0.3, 0.4, 0.7),

        shinySphere([0.5, 0, 1], -1.2, 0.2, 0.5),
        shinySphere([0.6, 0.2, 1], -2.5, 2, 0.75),
        shinySphere([0.6, 0.3, 1], 1.9, 6, 0.5),
        shinySphere([0.7, 0.3, 0.9], 1.3, -2.5, 0.8),
        shinySphere([0.8, 0.3, 0.9], -0.4, -1.5, 0.3),
        shinySphere([0.8, 0.3, 0.8], -1, 7, 0.5),
        shinySphere([0.9, 0.3, 0.8], 0.3, -1.1, 0.3),
        shinySphere([1, 0.4, 0.8], -1.4, -1.5, 0.5),
        shinySphere([1, 0.5, 0.9], -1.1, 4, 0.5),
        shinySphere([1, 0.6, 1], -3, 11, 0.5),
      ],
    },
  };

  if (options.lightShape === 'round') {
    scene.world.objects!.push({
      primitive: { type: 'sphere' },
      transform: [
        ['translate', -7, 8, -5],
        ['scale', 1.75, 1.75, 1.75],
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
