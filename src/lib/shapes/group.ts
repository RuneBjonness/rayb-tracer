import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { BvhNode } from './bvh-node';
import { TransformableShape, Shape } from './shape';

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

  protected localIntersects(r: Ray): Intersection[] {
    if (this.bvhNode) {
      return this.bvhNode.intersects(r).sort((a, b) => a.time - b.time);
    }

    if (this.localBounds.intersects(r)) {
      const intersections: Intersection[] = [];
      for (const shape of this.shapes) {
        intersections.push(...shape.intersects(r));
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
