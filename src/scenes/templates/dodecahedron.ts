import { SceneDefinition } from '../scene-definition';
import { metal } from './helpers/materials';
import { dodecahedronDefinition } from './helpers/shapes';

const edgeLength = 1 / 1.401258538;
const inscribedSphereRadius = edgeLength * 1.113516364;
const cylinderRadius = 0.1;

export const dodecahedronScene: SceneDefinition = {
  name: 'Dodecahedron',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [1, 2.5, -5],
      to: [1, 0, 0],
      up: [0, 1, 0],
    },
    aperture: 0.005,
    focalDistance: 2.5,
  },
  world: {
    ambientLight: 0.025,
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [
          ['rotateZ', 90],
          ['translate', -5.5, 2.5, -5],
        ],
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        transform: [
          ['translate', 0, -(inscribedSphereRadius + cylinderRadius), 0],
        ],
        material: {
          color: [0.6, 1, 0.8],
          diffuse: 0.67,
          specular: 0,
          reflective: 0.05,
        },
      },
      {
        primitive: 'dodecahedron',
        material: metal([0.5, 0.5, 0.5]),
        transform: [['rotateY', 12]],
      },
    ],
  },
  shapes: dodecahedronDefinition(edgeLength, cylinderRadius),
};
