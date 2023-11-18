import {
  MaterialDefinition,
  SceneDefinition,
  ShapeDefinition,
} from '../scene-definition';
import { diamond, glass, matte, metal, shiny } from './helpers/materials';

export function materialComparisonScene(): SceneDefinition {
  const scene: SceneDefinition = {
    name: `Materials`,
    camera: {
      fieldOfView: 45,
      viewTransform: {
        from: [0, 5, -20],
        to: [0, 1, 10],
        up: [0, 1, 0],
      },
      aperture: 0.04,
      focalDistance: 14,
    },
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [
          ['translate', -12, 24, -24],
          ['scale', 1.5, 1.5, 1.5],
        ],
        includeGeometry: false,
      },
    ],
    objects: [
      {
        type: 'plane',
        transform: [['translate', 0, -0.01, 0]],
        material: {
          color: 'paleBlue',
          ambient: 0.3,
          diffuse: 0.67,
          specular: 0,
        },
      },
      {
        type: 'plane',
        transform: [
          ['translate', 0, -0.01, 3],
          ['rotateX', 90],
        ],
        material: {
          pattern: {
            type: 'checkers',
            color1: 'darkTeal',
            color2: 'mistyTeal',
            transform: [
              ['translate', 0, -0.1, 0],
              ['scale', 0.75, 0.75, 0.75],
            ],
          },
          ambient: 0.3,
          diffuse: 0.67,
          specular: 0,
        },
      },
      getShapeSet(-6, 'matte'),
      getShapeSet(-3, 'shiny'),
      getShapeSet(0, 'metal'),
      getShapeSet(3, 'glass'),
      getShapeSet(6, 'diamond'),
    ],
    colors: {
      darkTeal: '#014d4e',
      mistyTeal: '#b4ece3',
      paleBlue: '#ccfdfe',
    },
    materials: {
      matte: matte('darkTeal'),
      shiny: shiny('darkTeal'),
      metal: metal('darkTeal'),
      glass: glass('darkTeal'),
      diamond: diamond('darkTeal'),
    },
  };

  return scene;
}

const getShapeSet = (
  x: number,
  material: MaterialDefinition | string
): ShapeDefinition => {
  return {
    type: 'group',
    transform: [
      ['translate', x, 0, 0],
      ['rotateY', -30],
    ],
    shapes: [
      {
        type: 'sphere',
        transform: [['translate', 0, 4, 0]],
        material,
      },
      {
        type: 'cube',
        transform: [['translate', 0, 1, 0]],
        material,
      },
      {
        type: 'sphere',
        transform: [
          ['translate', -0.5, 0.4, -1.75],
          ['scale', 0.4, 0.4, 0.4],
        ],
        material,
      },
      {
        type: 'cylinder',
        minimum: -1,
        maximum: 1,
        closed: true,
        transform: [
          ['translate', 0.5, 0.4, -1.75],
          ['scale', 0.4, 0.4, 0.4],
        ],
        material,
      },
    ],
  };
};
