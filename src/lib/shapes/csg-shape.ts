import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { Shape } from './shape';
import { TransformableShape } from './transformable-shape';

export class CsgShape extends TransformableShape {
  constructor(
    readonly operation: 'union' | 'intersection' | 'difference',
    readonly left: Shape,
    readonly right: Shape
  ) {
    super();
    this.shapeType = 'csg';
    left.parent = this;
    right.parent = this;

    this.localBounds = left.bounds.clone();
    this.localBounds.merge(right.bounds);
  }

  override divide(threshold: number): void {
    this.left.divide(threshold);
    this.right.divide(threshold);
  }

  validIntersection(
    leftHit: boolean,
    inLeft: boolean,
    inRight: boolean
  ): boolean {
    if (this.operation === 'union') {
      return (leftHit && !inRight) || (!leftHit && !inLeft);
    } else if (this.operation === 'intersection') {
      return (leftHit && inRight) || (!leftHit && inLeft);
    } else if (this.operation === 'difference') {
      return (leftHit && !inRight) || (!leftHit && inLeft);
    }
    return false;
  }

  filterIntersections(xs: Intersection[]): Intersection[] {
    let inl = false;
    let inr = false;
    const res: Intersection[] = [];
    for (const i of xs) {
      const lhit = this.includes(this.left, i.object);
      if (this.validIntersection(lhit, inl, inr)) {
        res.push(i);
      }
      if (lhit) {
        inl = !inl;
      } else {
        inr = !inr;
      }
    }
    return res;
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (this.localBounds.intersects(r)) {
      const intersections: Intersection[] = [
        ...this.left.intersects(r),
        ...this.right.intersects(r),
      ];
      return this.filterIntersections(
        intersections.sort((a, b) => a.time - b.time)
      );
    }
    return [];
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    const validIntersections = this.localIntersects(r);
    for (const i of validIntersections) {
      if (i.time >= 0 && i.time < maxDistance) {
        return true;
      }
    }
    return false;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    throw new Error(
      "CSG Shapes don't have normal vectors, and if this is called we have done something wrong somewhere.."
    );
  }

  private includes(s1: Shape, s2: Shape): boolean {
    if (s1.isGroup()) {
      const self = this;
      return s1.shapes.some((s) => self.includes(s, s2));
    }
    if (s1.isCsgShape()) {
      return this.includes(s1.left, s2) || this.includes(s1.right, s2);
    }
    return s1 === s2;
  }
}
