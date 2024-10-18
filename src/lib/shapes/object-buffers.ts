import { MatrixOrder } from '../math/matrices';
import { BvhNode } from './bvh-node';
import { Shape, ShapeType } from './shape';

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
  shapesArrayBuffer: ArrayBufferLike;
  shapeBufferOffset: number;
  primitivesArrayBuffer: ArrayBufferLike;
  primitiveBufferOffset: number;
  trianglesArrayBuffer: ArrayBufferLike;
  triangleBufferOffset: number;
  bvhArrayBuffer: ArrayBufferLike;
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
      if (shape.shapeType === ShapeType.PrimitiveSphere) {
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

export function toObjectBuffers(
  objects: Shape[],
  useSharedArrayBuffer: boolean,
  matrixOrder: MatrixOrder
): ObjectBuffers {
  const objCount = numberOfObjects(objects);
  console.log('Total objects: ', JSON.stringify(objCount, null, 2));
  const shapesSize = (objCount.shapes + 1) * SHAPE_BYTE_SIZE;
  const primitivesSize = (objCount.primitives + 1) * PRIMITIVE_BYTE_SIZE;
  const trianglesSize = (objCount.triangles + 1) * TRIANGLE_BYTE_SIZE;
  const bvhSize = (objCount.bvhNodes + 1) * BVH_NODE_BYTE_SIZE;

  const objectBuffers: ObjectBuffers = {
    shapesArrayBuffer: useSharedArrayBuffer
      ? new SharedArrayBuffer(shapesSize)
      : new ArrayBuffer(shapesSize),
    shapeBufferOffset: SHAPE_BYTE_SIZE,
    primitivesArrayBuffer: useSharedArrayBuffer
      ? new SharedArrayBuffer(primitivesSize)
      : new ArrayBuffer(primitivesSize),
    primitiveBufferOffset: PRIMITIVE_BYTE_SIZE,
    trianglesArrayBuffer: useSharedArrayBuffer
      ? new SharedArrayBuffer(trianglesSize)
      : new ArrayBuffer(trianglesSize),
    triangleBufferOffset: TRIANGLE_BYTE_SIZE,
    bvhArrayBuffer: useSharedArrayBuffer
      ? new SharedArrayBuffer(bvhSize)
      : new ArrayBuffer(bvhSize),
    bvhBufferOffset: BVH_NODE_BYTE_SIZE,
  };

  for (let i = 0; i < objects.length; i++) {
    objects[i].copyToArrayBuffers(objectBuffers, 0, matrixOrder);
  }
  return objectBuffers;
}
