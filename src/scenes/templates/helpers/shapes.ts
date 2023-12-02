import {
  ShapeDefinition,
  ShapePrimitiveDefinition,
  ColorDefinition,
  MaterialDefinition,
} from '../../scene-definition';
import { restingOnYplane } from './transforms';

export function sphere(
  x: number,
  z: number,
  scale: number,
  material: MaterialDefinition | string | [string, ColorDefinition | string]
): ShapeDefinition {
  return {
    primitive: { type: 'sphere' },
    transform: restingOnYplane(x, z, scale),
    material: material,
  };
}

export function dodecahedronDefinition(
  edgeLength: number,
  cylinderRadius: number
): Record<string, ShapePrimitiveDefinition> {
  const midradius = edgeLength * 1.309016994;

  return {
    edgeAndVertex: {
      type: 'csg',
      operation: 'union',
      left: {
        primitive: {
          type: 'cylinder',
          minimum: -0.5,
          maximum: 0.5,
          closed: true,
        },
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
        primitive: {
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
        primitive: 'bottomLowerAndMiddleEdges',
      },
      right: {
        primitive: {
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
  };
}
