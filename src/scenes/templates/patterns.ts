import { SceneDefinition } from '../scene-definition';
import { MATERIAL_GLASS, MATERIAL_METAL } from './helpers/materials';
import { sphere } from './helpers/shapes';

export const patternsScene: SceneDefinition = {
  name: 'Patterns',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 1.6, -5],
      to: [0, 1, 0],
      up: [0, 1, 0],
    },
    aperture: 0.005,
    focalDistance: 2.5,
  },
  world: {
    ambientLight: 0.01,
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [
          ['rotateZ', 90],
          ['translate', -5, 4, -4],
        ],
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        material: {
          pattern: {
            type: 'checkers',
            color1: 'lightGreen',
            color2: 'darkGreen',
            transform: [
              ['rotateY', -45],
              ['translate', 0, 0.5, 0],
            ],
          },
          specular: 0.8,
          reflective: 0.3,
        },
      },
      {
        primitive: { type: 'plane' },
        material: {
          color: 'lightGreen',
          ambient: 0.5,
          specular: 0.8,
        },
        transform: [['translate', 0, 5, 0]],
      },
      {
        primitive: { type: 'plane' },
        material: 'wall',
        transform: [
          ['rotateX', 90],
          ['rotateY', -45],
          ['translate', 0, 0, 10],
        ],
      },
      {
        primitive: { type: 'plane' },
        material: 'wall',
        transform: [
          ['rotateX', 90],
          ['rotateY', 45],
          ['translate', 0, 0, -10],
        ],
      },
      {
        primitive: { type: 'plane' },
        material: 'wall',
        transform: [
          ['rotateX', 90],
          ['rotateY', 45],
          ['translate', 0, 0, 10],
        ],
      },
      {
        primitive: { type: 'plane' },
        material: 'wall',
        transform: [
          ['rotateX', 90],
          ['rotateY', -45],
          ['translate', 0, 0, -10],
        ],
      },
      {
        primitive: {
          type: 'group',
          shapes: [
            sphere(-1.3, 0.1, 0.5, {
              pattern: {
                type: 'ring',
                color1: [0, 0.5, 0.5],
                color2: [0.2, 0.9, 0.9],
                transform: [
                  ['rotateX', 105],
                  ['rotateY', 30],
                  ['scale', 0.15, 0.15, 0.15],
                ],
              },
              specular: 0.2,
              shininess: 50,
              diffuse: 0.9,
            }),
            sphere(0.7, 1, 1, ['metal', [0.2, 0.2, 0.2]]),
            sphere(-1.4, -1, 0.25, {
              pattern: {
                type: 'blended',
                pattern1: {
                  type: 'stripe',
                  color1: 'darkBlueGreen',
                  color2: 'lightBlueGreen',
                  transform: [
                    ['scale', 0.25, 0.25, 0.25],
                    ['rotateZ', 45],
                  ],
                },
                pattern2: {
                  type: 'stripe',
                  color1: 'darkBlueGreen',
                  color2: 'lightBlueGreen',
                  transform: [
                    ['scale', 0.25, 0.25, 0.25],
                    ['rotateZ', -45],
                  ],
                },
              },
              specular: 0.2,
              shininess: 100,
            }),
            sphere(-0.3, -1.2, 0.5, ['glass', [0, 0, 0.3]]),
            sphere(-1.2, 2.5, 0.75, {
              pattern: {
                type: 'checkers',
                color1: [0.1, 0.4, 0.3],
                color2: [0.7, 0.9, 0.8],
                transform: [
                  ['rotateY', 30],
                  ['scale', 0.5, 0.5, 0.5],
                ],
              },
            }),
            sphere(1.5, -0.5, 0.5, {
              pattern: {
                type: 'radial-gradient',
                color1: [1, 1, 0],
                color2: [0, 1, 0],
                transform: [
                  ['rotateX', 80],
                  ['rotateY', -10],
                  ['scale', 0.2, 0.2, 0.2],
                ],
              },
              diffuse: 0.7,
              specular: 0.3,
            }),
          ],
        },
      },
    ],
  },
  colors: {
    lightGreen: [0.9, 1, 0.9],
    darkGreen: [0.1, 0.4, 0.1],
    lightBlueGreen: [0.4, 0.7, 1],
    darkBlueGreen: [0.1, 0.5, 1],
  },
  materials: {
    glass: MATERIAL_GLASS,
    metal: MATERIAL_METAL,
    wall: {
      pattern: {
        type: 'stripe',
        color1: 'lightGreen',
        color2: 'darkGreen',
      },
      reflective: 0.1,
    },
  },
};
