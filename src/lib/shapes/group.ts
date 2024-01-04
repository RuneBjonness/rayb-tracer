import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { Bounds } from './bounds';
import { BaseShape, Intersectable, Shape } from './shape';

export class Group extends BaseShape {
  shapes: Shape[] = [];
  bvhNode: BvhNode | null = null;

  constructor() {
    super();
    this.shapeType = 'group';
  }

  add(child: Shape) {
    child.parent = this;
    this.shapes.push(child);
    this.bounds.merge(child.transformedBounds);
  }

  override divide(threshold: number): void {
    this.bvhNode = new BvhNode();
    this.bvhNode.bounds = this.bounds;
    this.bvhNode.shapes = [...this.shapes];
    this.shapes = [];
    this.bvhNode.divide(threshold);
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (this.bounds.intersects(r)) {
      const intersections: Intersection[] = [];
      for (const shape of this.shapes) {
        intersections.push(...shape.intersects(r));
      }
      if (this.bvhNode) {
        intersections.push(...this.bvhNode.intersects(r));
      }
      return intersections.sort((a, b) => a.time - b.time);
    }
    return [];
  }

  protected localNormalAt(p: Vector4): Vector4 {
    throw new Error(
      "Groups don't have normal vectors, and if this is called we have done something wrong somewhere.."
    );
  }
}

export class BvhNode implements Intersectable {
  bvhNodes: BvhNode[] = [];
  shapes: Shape[] = [];
  bounds: Bounds = Bounds.empty();

  constructor() {}

  isLeafNode(): boolean {
    return this.bvhNodes.length === 0;
  }

  numberOfNodeDescendants(): number {
    return this.bvhNodes.reduce(
      (acc, n) => acc + n.numberOfNodeDescendants(),
      0
    );
  }

  numberOfShapeDescendants(): number {
    if (this.isLeafNode()) {
      return this.shapes.reduce((acc, s) => acc + s.numberOfDescendants(), 0);
    }
    return this.bvhNodes.reduce(
      (acc, n) => acc + n.numberOfShapeDescendants(),
      0
    );
  }

  copyToArrayBuffer(buffer: ArrayBuffer, offset: number): number {
    throw new Error('Method not implemented.');
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
      return intersections.sort((a, b) => a.time - b.time);
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
