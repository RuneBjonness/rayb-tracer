import { Intersection } from '../intersections';
import { Ray } from '../rays';
import { Bounds } from './bounds';
import { Intersectable, SHAPE_BYTE_SIZE, Shape } from './shape';

export const BVH_NODE_BYTE_SIZE = 48;

export class BvhNode implements Intersectable {
  bvhNodes: BvhNode[] = [];
  shapes: Shape[] = [];
  bounds: Bounds = Bounds.empty();

  constructor() {}

  isLeafNode(): boolean {
    return this.bvhNodes.length === 0;
  }

  numberOfNodeDescendants(): number {
    return (
      this.bvhNodes.length +
      this.bvhNodes.reduce((acc, n) => acc + n.numberOfNodeDescendants(), 0)
    );
  }

  numberOfShapeDescendants(): number {
    if (this.isLeafNode()) {
      return (
        this.shapes.length +
        this.shapes.reduce((acc, s) => acc + s.numberOfDescendants(), 0)
      );
    }
    return this.bvhNodes.reduce(
      (acc, n) => acc + n.numberOfShapeDescendants(),
      0
    );
  }

  copyToArrayBuffers(
    shapeBuffer: ArrayBuffer,
    shapeBufferOffset: number,
    bvhBuffer: ArrayBuffer,
    bvhBufferOffset: number,
    parentIndex: number
  ): [shapeOffset: number, bvhOffset: number] {
    const index = bvhBufferOffset / BVH_NODE_BYTE_SIZE;
    const u32view = new Uint32Array(bvhBuffer, bvhBufferOffset, 3);

    if (this.isLeafNode()) {
      const shapeIndex = shapeBufferOffset / SHAPE_BYTE_SIZE;
      u32view[0] = 1;
      u32view[1] = shapeIndex;
      u32view[2] = shapeIndex + this.numberOfShapeDescendants();
    } else {
      u32view[0] = 0;
      u32view[1] = index + 1;
      u32view[2] = index + this.numberOfNodeDescendants();
    }

    const f32view = new Float32Array(bvhBuffer, bvhBufferOffset, 12);

    f32view[4] = this.bounds.min.x;
    f32view[5] = this.bounds.min.y;
    f32view[6] = this.bounds.min.z;

    f32view[8] = this.bounds.max.x;
    f32view[9] = this.bounds.max.y;
    f32view[10] = this.bounds.max.z;

    bvhBufferOffset += BVH_NODE_BYTE_SIZE;

    for (const node of this.bvhNodes) {
      [shapeBufferOffset, bvhBufferOffset] = node.copyToArrayBuffers(
        shapeBuffer,
        shapeBufferOffset,
        bvhBuffer,
        bvhBufferOffset,
        parentIndex
      );
    }

    for (const shape of this.shapes) {
      [shapeBufferOffset, bvhBufferOffset] = shape.copyToArrayBuffers(
        shapeBuffer,
        shapeBufferOffset,
        bvhBuffer,
        bvhBufferOffset,
        parentIndex
      );
    }

    return [shapeBufferOffset, bvhBufferOffset];
  }

  add(shape: Shape) {
    this.shapes.push(shape);
    this.bounds.merge(shape.transformedBounds);
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

  divide(threshold: number): void {
    if (this.shapes.length > threshold) {
      const n1 = new BvhNode();
      const n2 = new BvhNode();

      const overlappingShapes: Shape[] = [];
      const [b1, b2] = this.bounds.split();

      for (const s of this.shapes) {
        if (b1.containsBounds(s.transformedBounds)) {
          n1.add(s);
        } else if (b2.containsBounds(s.transformedBounds)) {
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
