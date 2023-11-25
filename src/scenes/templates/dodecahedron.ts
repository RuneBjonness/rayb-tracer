import { SceneDefinition } from '../scene-definition';
import { metal } from './helpers/materials';

const edgeLength = 1 / 1.401258538;
const midradius = edgeLength * 1.309016994;
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
          ambient: 0.01,
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
  shapes: {
    edgeAndVertex: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: { type: 'cylinder', minimum: -0.5, maximum: 0.5 },
        transform: [['scale', cylinderRadius, edgeLength, cylinderRadius]],
      },
      right: {
        primitive: { type: 'sphere' },
        transform: [
          ['scale', cylinderRadius, cylinderRadius, cylinderRadius],
          ['translate', 0, edgeLength / 2, 0],
        ],
      },
    },
    bottomAndLowerEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'edgeAndVertex',
        transform: [
          ['rotateZ', 90],
          ['translate', 0, -midradius, -0],
          ['rotateX', 31.75],
        ],
      },
      right: {
        primitive: 'edgeAndVertex',
        transform: [
          ['rotateX', -90],
          ['translate', 0, -midradius, 0],
          ['rotateX', 58.75],
          ['rotateY', 36],
        ],
      },
    },
    bottomLowerAndMiddleEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'bottomAndLowerEdges',
      },
      right: {
        primitive: { type: 'cylinder', minimum: -0.5, maximum: 0.5 },
        transform: [
          ['scale', cylinderRadius, edgeLength, cylinderRadius],
          ['rotateZ', -60],
          ['translate', 0, 0, -midradius],
          ['rotateY', 18],
        ],
      },
    },
    bottomLowerAndTwoMiddleEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'bottomLowerAndMiddleEdges',
      },
      right: {
        primitive: { type: 'cylinder', minimum: -0.5, maximum: 0.5 },
        transform: [
          ['scale', cylinderRadius, edgeLength, cylinderRadius],
          ['rotateZ', 60],
          ['translate', 0, 0, -midradius],
          ['rotateY', -18],
        ],
      },
    },
    sixEdgesTopToBottom: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'bottomLowerAndTwoMiddleEdges',
      },
      right: {
        primitive: 'bottomAndLowerEdges',
        transform: [
          ['rotateZ', 180],
          ['rotateY', 36],
        ],
      },
    },
    twelveEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'sixEdgesTopToBottom',
      },
      right: {
        primitive: 'sixEdgesTopToBottom',
        transform: [['rotateY', 72]],
      },
    },
    twentyFourEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'twelveEdges',
      },
      right: {
        primitive: 'twelveEdges',
        transform: [['rotateY', 72 * 2]],
      },
    },
    dodecahedron: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: 'twentyFourEdges',
      },
      right: {
        primitive: 'sixEdgesTopToBottom',
        transform: [['rotateY', -72]],
      },
    },
  },
};
