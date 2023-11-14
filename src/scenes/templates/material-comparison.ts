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
          color: [0.75, 0.85, 0.85],
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
            color1: [0.15, 0.25, 0.25],
            color2: [0.75, 0.85, 0.85],
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
      ...getShapeSet(-6, 'matte'),
      ...getShapeSet(-3, 'shiny'),
      ...getShapeSet(0, 'metal'),
      ...getShapeSet(3, 'glass'),
      ...getShapeSet(6, 'diamond'),
    ],
    colors: {
      darkTeal: [0.12, 0.27, 0.27],
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
): ShapeDefinition[] => {
  return [
    {
      type: 'sphere',
      transform: [['translate', x, 4, 0]],
      material,
    },
    {
      type: 'cube',
      transform: [
        ['translate', x, 1, 0],
        ['rotateY', 60],
      ],
      material,
    },
    {
      type: 'sphere',
      transform: [
        ['translate', x - 0.5, 0.4, -3],
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
        ['translate', x + 0.5, 0.4, -3],
        ['scale', 0.4, 0.4, 0.4],
      ],
      material,
    },
  ];
};
