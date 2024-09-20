import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { BvhNode } from './bvh-node';
import { Shape } from './shape';
import { TransformableShape } from './transformable-shape';

export class Group extends TransformableShape {
  shapes: Shape[] = [];
  bvhNode: BvhNode | null = null;

  constructor() {
    super();
    this.shapeType = 'group';
  }

  add(child: Shape) {
    child.parent = this;
    this.shapes.push(child);
    this.localBounds.merge(child.bounds);
  }

  override divide(threshold: number): void {
    this.shapeType = 'group-bvh';
    this.bvhNode = new BvhNode();
    this.bvhNode.bounds = this.localBounds;
    this.bvhNode.shapes = [...this.shapes];
    this.shapes = [];
    this.bvhNode.divide(threshold);
  }

  protected localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    if (this.bvhNode) {
      return this.bvhNode.intersects(r, accumulatedIntersections);
    }

    if (this.localBounds.intersects(r)) {
      for (const shape of this.shapes) {
        shape.intersects(r, accumulatedIntersections);
      }
    }
    return accumulatedIntersections;
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    if (this.bvhNode) {
      return this.bvhNode.hits(r, maxDistance);
    }

    if (this.localBounds.intersects(r)) {
      for (const shape of this.shapes) {
        if (shape.hits(r, maxDistance)) {
          return true;
        }
      }
    }
    return false;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    throw new Error(
      "Groups don't have normal vectors, and if this is called we have done something wrong somewhere.."
    );
  }
}
