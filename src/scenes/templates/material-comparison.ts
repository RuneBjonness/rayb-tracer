import { SceneDefinition } from '../scene-definition';
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
    world: {
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
          primitive: { type: 'plane' },
          transform: [['translate', 0, -0.01, 0]],
          material: {
            color: 'paleBlue',
            ambient: 0.3,
            diffuse: 0.67,
            specular: 0,
          },
        },
        {
          primitive: { type: 'plane' },
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
        {
          primitive: 'shapeSet',
          material: 'matte',
          transform: [
            ['translate', -6, 0, 0],
            ['rotateY', -30],
          ],
        },
        {
          primitive: 'shapeSet',
          material: 'shiny',
          transform: [
            ['translate', -3, 0, 0],
            ['rotateY', -30],
          ],
        },
        {
          primitive: 'shapeSet',
          material: 'metal',
          transform: [['rotateY', -30]],
        },
        {
          primitive: 'shapeSet',
          material: 'glass',
          transform: [
            ['translate', 3, 0, 0],
            ['rotateY', -30],
          ],
        },
        {
          primitive: 'shapeSet',
          material: 'diamond',
          transform: [
            ['translate', 6, 0, 0],
            ['rotateY', -30],
          ],
        },
      ],
    },
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
    shapes: {
      shapeSet: {
        type: 'group',
        shapes: [
          {
            primitive: { type: 'sphere' },
            transform: [['translate', 0, 4, 0]],
          },
          {
            primitive: { type: 'cube' },
            transform: [['translate', 0, 1, 0]],
          },
          {
            primitive: { type: 'sphere' },
            transform: [
              ['translate', -0.5, 0.4, -1.75],
              ['scale', 0.4, 0.4, 0.4],
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
              ['translate', 0.5, 0.4, -1.75],
              ['scale', 0.4, 0.4, 0.4],
            ],
          },
        ],
      },
    },
  };

  return scene;
}
