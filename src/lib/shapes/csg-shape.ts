import { Intersection } from '../intersections';
import { Ray } from '../rays';
import { Tuple } from '../tuples';
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
    xs.forEach((i) => {
      const lhit = this.includes(this.left, i.object);

      if (this.validIntersection(lhit, inl, inr)) {
        res.push(i);
      }

      if (lhit) {
        inl = !inl;
      } else {
        inr = !inr;
      }
    });

    return res;
  }

  protected localIntersects(r: Ray): Intersection[] {
    return intersectsBounds(this.bounds(), r)
      ? this.filterIntersections(
          [this.left, this.right]
            .flatMap((x) => x.intersects(r))
            .sort((a, b) => a.time - b.time)
        )
      : [];
  }

  protected localNormalAt(p: Tuple): Tuple {
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
