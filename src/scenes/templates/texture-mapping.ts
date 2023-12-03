import { SceneDefinition } from '../scene-definition';
import { MATERIAL_SHINY } from './helpers/materials';

export const textureMappingScene: SceneDefinition = {
  name: 'TextureMapping',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 1.75, -5],
      to: [0, 1.25, 0],
      up: [0, 1, 0],
    },
    aperture: 0.005,
    focalDistance: 2.5,
  },
  world: {
    ambientLight: 0.1,
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [
          ['rotateZ', 90],
          ['rotateY', -45],
          ['translate', -4, 5, -4],
        ],
        includeGeometry: true,
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        material: {
          pattern: {
            type: 'texture-map',
            uvPattern: {
              type: 'uv-checkers',
              width: 2,
              height: 2,
              color1: [0.83, 0.9, 0.95],
              color2: [0.1, 0.32, 0.46],
            },
            mapper: 'planar',
            transform: [
              ['rotateY', -45],
              ['translate', 0, 0.5, 0],
            ],
          },
        },
      },
      {
        primitive: { type: 'sphere' },
        transform: [['translate', 0, 1, 0]],
        material: {
          pattern: {
            type: 'texture-map',
            uvPattern: {
              type: 'uv-checkers',
              width: 16,
              height: 8,
              color1: [1, 0.98, 0.91],
              color2: [0.95, 0.77, 0.06],
            },
            mapper: 'spherical',
          },
          ...MATERIAL_SHINY,
        },
      },
      {
        primitive: { type: 'cylinder', minimum: 0, maximum: 0.625 },
        transform: [
          ['scale', 1.25, 1.25 * 3.1415, 1.25],
          ['translate', -1.75, 0, 2.5],
        ],
        material: {
          pattern: {
            type: 'texture-map',
            uvPattern: {
              type: 'uv-checkers',
              width: 16,
              height: 8,
              color1: [0.91, 0.96, 0.95],
              color2: [0.08, 0.56, 0.47],
            },
            mapper: 'cylindrical',
          },
          ...MATERIAL_SHINY,
        },
      },
      {
        primitive: { type: 'cube' },
        transform: [
          ['scale', 1.25, 1.25, 1.25],
          ['rotateY', 45],
          ['translate', 1.75, 1.25, 2.8],
        ],
        material: {
          pattern: {
            type: 'cube-map',
            uvPattern: {
              type: 'uv-checkers',
              width: 5,
              height: 5,
              color1: [0.98, 0.86, 0.95],
              color2: [0.68, 0.06, 0.57],
            },
          },
          ...MATERIAL_SHINY,
        },
      },
    ],
  },
};
