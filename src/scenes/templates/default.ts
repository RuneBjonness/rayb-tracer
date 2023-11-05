import { SceneDefinition } from '../scene-definition';

export const defaultScene: SceneDefinition = {
  name: 'Default Scene',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 2, -5],
      to: [0, 0, 0],
      up: [0, 1, 0],
    },
    aperture: 0.01,
    focalDistance: 5,
  },
  lights: [
    {
      type: 'point',
      intensity: [1, 1, 1],
      position: [-10, 10, -10],
    },
  ],
  objects: [
    {
      type: 'plane',
      material: {
        color: [1, 1, 1],
        ambient: 0.025,
        diffuse: 0.67,
        specular: 0,
        reflective: 0.2,
      },
    },
    {
      type: 'sphere',
      transform: [['translate', 0, 1, 0]],
      material: {
        color: [0.5, 0, 1],
        ambient: 0.1,
        diffuse: 0.7,
        specular: 0.3,
        shininess: 200,
        reflective: 0.1,
      },
    },
  ],
};
