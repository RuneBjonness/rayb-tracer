import { BvhNode } from './bvh-node';
import { Shape } from './shape';

export const SHAPE_BYTE_SIZE = 256;
export const PRIMITIVE_BYTE_SIZE = 32;
export const TRIANGLE_BYTE_SIZE = 96;
export const BVH_NODE_BYTE_SIZE = 48;

export enum ObjectBufferType {
  Shape = 0,
  Primitive = 1,
  Triangle = 2,
  BvhNode = 3,
}

export type ObjectBuffers = {
  shapesArrayBuffer: ArrayBuffer;
  shapeBufferOffset: number;
  primitivesArrayBuffer: ArrayBuffer;
  primitiveBufferOffset: number;
  trianglesArrayBuffer: ArrayBuffer;
  triangleBufferOffset: number;
  bvhArrayBuffer: ArrayBuffer;
  bvhBufferOffset: number;
};

export type ObjectCount = {
  shapes: number;
  primitives: number;
  triangles: number;
  bvhNodes: number;
};

export function numberOfObjects(
  shapes: Shape[],
  bvhNodes: BvhNode[] = [],
  objCount: ObjectCount = {
    shapes: 0,
    primitives: 0,
    triangles: 0,
    bvhNodes: 0,
  }
): ObjectCount {
  for (const shape of shapes) {
    if (shape.isTransformable()) {
      objCount.shapes++;
      if (shape.isGroup()) {
        if (shape.bvhNode) {
          objCount.bvhNodes++;
        }
        numberOfObjects(shape.shapes, shape.bvhNode?.bvhNodes ?? [], objCount);
      } else if (shape.isCsgShape()) {
        numberOfObjects([shape.left, shape.right], [], objCount);
      }
    } else {
      if (shape.shapeType === 'primitive-sphere') {
        objCount.primitives++;
      } else {
        objCount.triangles++;
      }
    }
  }
  for (const node of bvhNodes) {
    objCount.bvhNodes++;
    numberOfObjects(node.shapes, node.bvhNodes, objCount);
  }
  return objCount;
}
