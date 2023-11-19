import { SceneDefinition, ShapePrimitiveDefinition } from '../scene-definition';

export const CsgRbScene: SceneDefinition = {
  name: 'CsgRb',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 6.2, -1.75],
      to: [0, 0, 0],
      up: [0, 1, 0],
    },
    aperture: 0.005,
    focalDistance: 2,
  },
  world: {
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [['translate', -2, 2.5, -2.5]],
      },
    ],
    objects: [
      {
        primitive: { type: 'plane' },
        material: 'matteBlue',
      },
      {
        primitive: {
          type: 'group',
          shapes: [
            {
              primitive: 'capitalR',
              transform: [['translate', -9.4, 0, 0]],
            },
            {
              primitive: 'lowercaseA',
              transform: [['translate', -7.4, 0, 0]],
            },
            {
              primitive: 'lowercaseY',
              transform: [['translate', -5.4, 0, 0]],
            },
            {
              primitive: 'capitalB',
              transform: [['translate', -3.4, 0, 0]],
            },
            {
              primitive: 'capitalT',
              transform: [['translate', -0.4, 0, 0]],
            },
            {
              primitive: 'lowercaseR',
              transform: [['translate', 1.1, 0, 0]],
            },
            {
              primitive: 'lowercaseA',
              transform: [['translate', 3.1, 0, 0]],
            },
            {
              primitive: 'lowercaseC',
              transform: [['translate', 5.3, 0, 0]],
            },
            {
              primitive: 'lowercaseE',
              transform: [['translate', 7.3, 0, 0]],
            },
            {
              primitive: 'lowercaseR',
              transform: [['translate', 9.3, 0, 0]],
            },
          ],
        },
        material: 'purple',
        transform: [['translate', 0, 0.25, 1]],
      },
    ],
  },
  materials: {
    matteBlue: {
      color: [0.2, 0, 0.8],
      specular: 0,
      ambient: 0.025,
      diffuse: 0.67,
    },
    purple: {
      color: [0.66, 0.35, 0.85],
    },
  },
  shapes: {
    circle: {
      type: 'csg',
      operation: 'difference',
      left: {
        primitive: {
          type: 'cylinder',
          minimum: 0,
          maximum: 0.25,
          closed: true,
        },
      },
      right: {
        primitive: { type: 'cylinder', minimum: 0, maximum: 0.3, closed: true },
        transform: [['scale', 0.5, 1, 0.5]],
      },
    },
    halfCircle: {
      type: 'csg',
      operation: 'difference',
      left: {
        primitive: 'circle',
      },
      right: {
        primitive: { type: 'cube' },
        transform: [['translate', -1, 0, 0]],
      },
    },
    capitalP: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', -0.25, 0.125, -1],
          ['scale', 0.25, 0.125, 2],
        ],
      },
      right: {
        primitive: 'halfCircle',
      },
    },
    capitalR: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0.5, 0.125, -1.9],
          ['scale', 0.25, 0.125, 1.1],
          ['shear', 0, -1, 0, 0, 0, 0],
        ],
      },
      right: {
        primitive: 'capitalP',
      },
    },
    capitalB: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'halfCircle',
        transform: [
          ['translate', 0, 0, -1.8],
          ['scale', 1.3, 1, 1.2],
        ],
      },
      right: {
        primitive: 'capitalP',
      },
    },
    capitalT: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0, 0.125, -1],
          ['scale', 0.25, 0.125, 2],
        ],
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0, 0.125, 0.75],
          ['scale', 1, 0.125, 0.25],
        ],
      },
    },
    lowercaseA: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'circle',
        transform: [['translate', 0, 0, -2]],
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0.75, 0.125, -2],
          ['scale', 0.25, 0.125, 1],
        ],
      },
    },
    lowercaseC: {
      type: 'csg',
      operation: 'difference',
      left: {
        primitive: 'circle',
        transform: [['translate', 0, 0, -2]],
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 1.5, 0, -2],
          ['rotateY', 45],
        ],
      },
    },
    lowercaseE: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'csg',
          operation: 'difference',
          left: {
            primitive: 'circle',
            transform: [['translate', 0, 0, -2]],
          },
          right: {
            primitive: {
              type: 'cube',
            },
            transform: [
              ['translate', 0.75, 0, -2.15],
              ['scale', 1, 1, 0.25],
            ],
          },
        },
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0.25, 0.125, -2],
          ['scale', 0.75, 0.125, 0.25],
        ],
      },
    },
    lowercaseR: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'csg',
          operation: 'intersection',
          left: {
            primitive: 'circle',
            transform: [['translate', 0.1, 0, -2]],
          },
          right: {
            primitive: {
              type: 'cube',
            },
            transform: [
              ['translate', 0, 0, -0.8],
              ['rotateY', 45],
            ],
          },
        },
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', -0.5, 0.125, -2],
          ['scale', 0.25, 0.125, 1],
        ],
      },
    },
    lowercaseY: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', -0.12, 0.125, -2],
          ['scale', 0.25, 0.125, 1],
          ['shear', 0, -2, 0, 0, 0, 0],
        ],
      },
      right: {
        primitive: {
          type: 'cube',
        },
        transform: [
          ['translate', 0.5, 0.125, -2.6],
          ['scale', 0.25, 0.125, 1.6],
          ['shear', 0, 2, 0, 0, 0, 0],
        ],
      },
    },
  },
};
