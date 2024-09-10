import { Intersection } from '../intersections';
import { MatrixOrder } from '../math/matrices';
import { Ray } from '../rays';
import { Bounds } from './bounds';
import {
  BVH_NODE_BYTE_SIZE,
  ObjectBufferType,
  ObjectBuffers,
  PRIMITIVE_BYTE_SIZE,
  SHAPE_BYTE_SIZE,
  TRIANGLE_BYTE_SIZE,
  numberOfObjects,
} from './object-buffers';
import { Intersectable, Shape } from './shape';

export class BvhNode implements Intersectable {
  bvhNodes: BvhNode[] = [];
  shapes: Shape[] = [];
  bounds: Bounds = Bounds.empty();

  constructor() {}

  isLeafNode(): boolean {
    return this.bvhNodes.length === 0;
  }

  hasPrimitiveChildren(): boolean {
    return (
      this.shapes.length > 0 && this.shapes[0].shapeType === 'primitive-sphere'
    );
  }

  hasTriangleChildren(): boolean {
    return (
      this.shapes.length > 0 &&
      (this.shapes[0].shapeType === 'triangle' ||
        this.shapes[0].shapeType === 'smooth-triangle')
    );
  }

  copyToArrayBuffers(
    buffers: ObjectBuffers,
    parentIndex: number,
    matrixOrder: MatrixOrder
  ): void {
    const index = buffers.bvhBufferOffset / BVH_NODE_BYTE_SIZE;
    const u32view = new Uint32Array(
      buffers.bvhArrayBuffer,
      buffers.bvhBufferOffset,
      4
    );

    if (this.isLeafNode()) {
      u32view[0] = 1;
      if (this.hasPrimitiveChildren()) {
        const primitiveIndex =
          buffers.primitiveBufferOffset / PRIMITIVE_BYTE_SIZE;
        u32view[1] = ObjectBufferType.Primitive;
        u32view[2] = primitiveIndex;
        u32view[3] =
          primitiveIndex + numberOfObjects(this.shapes).primitives - 1;
      } else if (this.hasTriangleChildren()) {
        const triangleIndex = buffers.triangleBufferOffset / TRIANGLE_BYTE_SIZE;
        u32view[1] = ObjectBufferType.Triangle;
        u32view[2] = triangleIndex;
        u32view[3] = triangleIndex + numberOfObjects(this.shapes).triangles - 1;
      } else {
        const shapeIndex = buffers.shapeBufferOffset / SHAPE_BYTE_SIZE;
        u32view[1] = ObjectBufferType.Shape;
        u32view[2] = shapeIndex;
        u32view[3] = shapeIndex + numberOfObjects(this.shapes).shapes - 1;
      }
    } else {
      u32view[0] = 0;
      u32view[1] = ObjectBufferType.BvhNode;
      u32view[2] = index + 1;
      u32view[3] = index + numberOfObjects([], this.bvhNodes).bvhNodes;
    }

    const f32view = new Float32Array(
      buffers.bvhArrayBuffer,
      buffers.bvhBufferOffset,
      12
    );

    f32view[4] = this.bounds.min.x;
    f32view[5] = this.bounds.min.y;
    f32view[6] = this.bounds.min.z;

    f32view[8] = this.bounds.max.x;
    f32view[9] = this.bounds.max.y;
    f32view[10] = this.bounds.max.z;

    buffers.bvhBufferOffset += BVH_NODE_BYTE_SIZE;

    for (const node of this.bvhNodes) {
      node.copyToArrayBuffers(buffers, parentIndex, matrixOrder);
    }

    for (const shape of this.shapes) {
      shape.copyToArrayBuffers(buffers, parentIndex, matrixOrder);
    }
  }

  add(shape: Shape) {
    this.shapes.push(shape);
    this.bounds.merge(shape.bounds);
  }

  intersects(r: Ray): Intersection[] {
    if (this.bounds.intersects(r)) {
      const intersections: Intersection[] = [];
      if (this.isLeafNode()) {
        for (const shape of this.shapes) {
          intersections.push(...shape.intersects(r));
        }
      } else {
        for (const node of this.bvhNodes) {
          intersections.push(...node.intersects(r));
        }
      }
      return intersections;
    }
    return [];
  }

  hits(r: Ray, maxDistance: number): boolean {
    if (this.bounds.intersects(r)) {
      if (this.isLeafNode()) {
        for (const shape of this.shapes) {
          if (shape.hits(r, maxDistance)) {
            return true;
          }
        }
      } else {
        for (const node of this.bvhNodes) {
          if (node.hits(r, maxDistance)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  divide(threshold: number): void {
    if (this.shapes.length > threshold) {
      const n1 = new BvhNode();
      const n2 = new BvhNode();

      const overlappingShapes: Shape[] = [];
      const [b1, b2] = this.bounds.split();

      for (const s of this.shapes) {
        if (b1.containsBounds(s.bounds)) {
          n1.add(s);
        } else if (b2.containsBounds(s.bounds)) {
          n2.add(s);
        } else {
          overlappingShapes.push(s);
        }
      }

      if (n1.shapes.length > 0 || n2.shapes.length > 0) {
        this.shapes = [];
        if (n1.shapes.length > 0) {
          this.bvhNodes.push(n1);
        }
        if (n2.shapes.length > 0) {
          this.bvhNodes.push(n2);
        }

        if (overlappingShapes.length > 0) {
          const n3 = new BvhNode();
          for (const s of overlappingShapes) {
            n3.add(s);
          }
          this.bvhNodes.push(n3);
        }
      }
    }
    for (const n of this.bvhNodes) {
      n.divide(threshold);
    }
    for (const s of this.shapes) {
      s.divide(threshold);
    }
  }
}
