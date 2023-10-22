import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { Bounds, intersectsBounds, transformGroupBounds } from './bounds';
import { Group } from './group';
import { Shape } from './shape';

export class CsgShape extends Shape {
  private groupBounds: Bounds | null = null;

  constructor(
    public operation: 'union' | 'intersection' | 'difference',
    public left: Shape,
    public right: Shape
  ) {
    super();
    left.parent = this;
    right.parent = this;
  }

  bounds(): Bounds {
    if (!this.groupBounds) {
      this.groupBounds = transformGroupBounds([this.left, this.right]);
    }
    return this.groupBounds;
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
    if (intersectsBounds(this.bounds(), r)) {
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

  protected localNormalAt(p: Vector4): Vector4 {
    throw new Error(
      "CSG Shapes don't have normal vectors, and if this is called we have done something wrong somewhere.."
    );
  }

  private includes(s1: Shape, s2: Shape): boolean {
    if (this.isGroup(s1)) {
      const self = this;
      return s1.shapes.some((s) => self.includes(s, s2));
    }
    if (this.isCsgShape(s1)) {
      return this.includes(s1.left, s2) || this.includes(s1.right, s2);
    }
    return s1 === s2;
  }
  private isGroup(shape: Shape): shape is Group {
    return (<Group>shape).shapes !== undefined;
  }
  private isCsgShape(shape: Shape): shape is CsgShape {
    return (<CsgShape>shape).operation !== undefined;
  }
}
