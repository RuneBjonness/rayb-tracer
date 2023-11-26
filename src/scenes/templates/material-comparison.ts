import { SceneDefinition } from '../scene-definition';
import { diamond, glass, matte, metal, shiny } from './helpers/materials';
import { dodecahedronDefinition } from './helpers/shapes';

export const materialComparisonScene: SceneDefinition = {
  name: `Materials`,
  camera: {
    fieldOfView: 45,
    viewTransform: {
      from: [0, 7, -20],
      to: [0, 0, 10],
      up: [0, 1, 0],
    },
    aperture: 0.04,
    focalDistance: 14,
  },
  world: {
    ambientLight: 0.2,
    lights: [
      {
        type: 'area',
        intensity: [0.75, 0.75, 0.75],
        transform: [['translate', -6, 8, -12]],
        includeGeometry: false,
      },
      {
        type: 'area',
        intensity: [0.75, 0.75, 0.75],
        transform: [
          ['rotateX', 120],
          ['translate', 6, 2.5, -12],
        ],
        includeGeometry: false,
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        transform: [['translate', 0, -0.001, 0]],
        material: 'matteLight',
      },
      {
        primitive: { type: 'plane' },
        transform: [['translate', 0, 15, 0]],
        material: 'matteLight',
      },
      {
        primitive: { type: 'plane' },
        transform: [
          ['rotateX', 90],
          ['translate', 0, 0, -28],
        ],
        material: 'matteLight',
      },
      {
        primitive: { type: 'plane' },
        transform: [
          ['rotateZ', 90],
          ['translate', -15, 0, 0],
        ],
        material: 'matteLight',
      },
      {
        primitive: { type: 'plane' },
        transform: [
          ['rotateZ', 90],
          ['translate', 15, 0, 0],
        ],
        material: 'matteLight',
      },
      {
        primitive: { type: 'plane' },
        transform: [
          ['rotateX', 90],
          ['translate', 0, -0.01, 3],
        ],
        material: {
          pattern: {
            type: 'checkers',
            color1: 'darkTeal',
            color2: 'mistyTeal',
            transform: [
              ['scale', 0.75, 0.75, 0.75],
              ['translate', 0, -0.1, 0],
            ],
          },
          diffuse: 0.67,
          specular: 0,
        },
      },
      {
        primitive: 'shapeSet',
        material: 'matte',
        transform: [['translate', -6, 0, 0]],
      },
      {
        primitive: 'shapeSet',
        material: 'shiny',
        transform: [['translate', -3, 0, 0]],
      },
      {
        primitive: 'shapeSet',
        material: 'metal',
      },
      {
        primitive: 'shapeSet',
        material: 'glass',
        transform: [['translate', 3, 0, 0]],
      },
      {
        primitive: 'shapeSet',
        material: 'diamond',
        transform: [['translate', 6, 0, 0]],
      },
    ],
  },
  colors: {
    darkTeal: '#014d4e',
    mistyTeal: '#b4ece3',
  },
  materials: {
    matte: matte('darkTeal'),
    shiny: shiny('darkTeal'),
    metal: metal('darkTeal'),
    glass: glass('darkTeal'),
    diamond: diamond('darkTeal'),
    matteLight: matte('mistyTeal'),
  },
  shapes: {
    ...dodecahedronDefinition(1 / 1.401258538, 0.1),
    shapeSet: {
      type: 'group',
      shapes: [
        {
          primitive: { type: 'sphere' },
          transform: [['translate', 0, 4.5, 0]],
        },
        {
          primitive: 'dodecahedron',
          transform: [
            ['scale', 0.8, 0.8, 0.8],
            ['translate', 0, 2.52, 0],
            ['rotateY', 32],
          ],
        },
        {
          primitive: { type: 'cube' },
          transform: [
            ['scale', 0.9, 0.9, 0.9],
            ['translate', 0, 0.9, 0],
            ['rotateY', -30],
          ],
        },
        {
          primitive: { type: 'sphere' },
          transform: [
            ['scale', 0.4, 0.4, 0.4],
            ['translate', -0.5, 0.4, -2.75],
          ],
        },
        {
          primitive: {
            type: 'cylinder',
            minimum: -1,
            maximum: 1,
            closed: true,
          },
          transform: [
            ['scale', 0.4, 0.5, 0.4],
            ['translate', 0.5, 0.5, -2.75],
          ],
        },
      ],
    },
  },
};
