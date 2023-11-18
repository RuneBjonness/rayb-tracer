import { SceneDefinition } from '../scene-definition';

export const defaultScene: SceneDefinition = {
  name: 'Default Scene',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 2, -5],
      to: [0, 0.5, 0],
      up: [0, 1, 0],
    },
    aperture: 0.02,
    focalDistance: 4,
  },
  world: {
    lights: [
      {
        type: 'point',
        intensity: [1, 1, 1],
        position: [-10, 10, -2],
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        material: {
          color: [1, 1, 1],
          ambient: 0.01,
          diffuse: 0.67,
          specular: 0,
          reflective: 0.2,
        },
      },
      {
        primitive: { type: 'sphere' },
        transform: [['translate', -0.8, 1, 0]],
        material: {
          color: [0.5, 0, 1],
          ambient: 0.01,
          diffuse: 0.67,
          specular: 0.3,
          shininess: 400,
          reflective: 0.3,
        },
      },
    ],
  },
};
