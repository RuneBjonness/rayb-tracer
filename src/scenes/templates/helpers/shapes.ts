import {
  ShapeDefinition,
  ColorDefinition,
  MaterialDefinition,
  ShapeTypeDefinition,
} from '../../scene-definition';
import { restingOnYplane } from './transforms';

export function sphere(
  x: number,
  z: number,
  scale: number,
  material: MaterialDefinition | string | [string, ColorDefinition | string]
): ShapeDefinition {
  return {
    type: { type: 'sphere' },
    transform: restingOnYplane(x, z, scale),
    material: material,
  };
}

export function primitiveSphere(
  x: number,
  z: number,
  scale: number,
  material: MaterialDefinition | string | [string, ColorDefinition | string]
): ShapeDefinition {
  return {
    type: { type: 'primitive-sphere', center: [x, scale, z], radius: scale },
    material: material,
  };
}

export function dodecahedronDefinition(
  edgeLength: number,
  cylinderRadius: number
): Record<string, ShapeTypeDefinition> {
  const midradius = edgeLength * 1.309016994;

  return {
    edgeAndVertex: {
      type: 'csg',
      operation: 'union',
      left: {
        type: {
          type: 'cylinder',
          minimum: -0.5,
          maximum: 0.5,
          closed: true,
        },
        transform: [['scale', cylinderRadius, edgeLength, cylinderRadius]],
      },
      right: {
        type: { type: 'sphere' },
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
        type: 'edgeAndVertex',
        transform: [
          ['rotateZ', 90],
          ['translate', 0, -midradius, -0],
          ['rotateX', 31.75],
        ],
      },
      right: {
        type: 'edgeAndVertex',
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
        type: 'bottomAndLowerEdges',
      },
      right: {
        type: {
          type: 'cylinder',
          minimum: -0.5,
          maximum: 0.5,
          closed: true,
        },
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
        type: 'bottomLowerAndMiddleEdges',
      },
      right: {
        type: {
          type: 'cylinder',
          minimum: -0.5,
          maximum: 0.5,
          closed: true,
        },
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
        type: 'bottomLowerAndTwoMiddleEdges',
      },
      right: {
        type: 'bottomAndLowerEdges',
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
        type: 'sixEdgesTopToBottom',
      },
      right: {
        type: 'sixEdgesTopToBottom',
        transform: [['rotateY', 72]],
      },
    },
    twentyFourEdges: {
      type: 'csg',
      operation: 'union',
      left: {
        type: 'twelveEdges',
      },
      right: {
        type: 'twelveEdges',
        transform: [['rotateY', 72 * 2]],
      },
    },
    dodecahedron: {
      type: 'csg',
      operation: 'union',
      left: {
        type: 'twentyFourEdges',
      },
      right: {
        type: 'sixEdgesTopToBottom',
        transform: [['rotateY', -72]],
      },
    },
  };
}
