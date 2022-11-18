import { intersection, Intersection } from '../../intersections';
import { Ray } from '../../rays';
import {
  cross,
  dot,
  point,
  subtract,
  Tuple,
  vector,
  add,
  multiplyTupleByScalar,
} from '../../tuples';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class SmoothTriangle extends Shape {
  e1: Tuple;
  e2: Tuple;

  private calculatedBounds: Bounds | null = null;

  constructor(
    public p1: Tuple,
    public p2: Tuple,
    public p3: Tuple,
    public n1: Tuple,
    public n2: Tuple,
    public n3: Tuple
  ) {
    super();
    this.e1 = subtract(p2, p1);
    this.e2 = subtract(p3, p1);
  }

  bounds(): Bounds {
    if (this.calculatedBounds) {
      return this.calculatedBounds;
    }

    this.calculatedBounds = [
      point(
        Math.min(this.p1[0], this.p2[0], this.p3[0]),
        Math.min(this.p1[1], this.p2[1], this.p3[1]),
        Math.min(this.p1[2], this.p2[2], this.p3[2])
      ),
      point(
        Math.max(this.p1[0], this.p2[0], this.p3[0]),
        Math.max(this.p1[1], this.p2[1], this.p3[1]),
        Math.max(this.p1[2], this.p2[2], this.p3[2])
      ),
    ];
    return this.calculatedBounds;
  }

  protected localIntersects(r: Ray): Intersection[] {
    const dirCrossE2 = cross(r.direction, this.e2);
    const det = dot(this.e1, dirCrossE2);

    if (Math.abs(det) < 0.00001) {
      return [];
    }

    const f = 1 / det;
    const p1ToOrigin = subtract(r.origin, this.p1);
    const u = f * dot(p1ToOrigin, dirCrossE2);

    if (u < 0 || u > 1) {
      return [];
    }

    const originCrossE1 = cross(p1ToOrigin, this.e1);
    const v = f * dot(r.direction, originCrossE1);

    if (v < 0 || u + v > 1) {
      return [];
    }

    const t = f * dot(this.e2, originCrossE1);
    return [intersection(t, this, u, v)];
  }

  protected localNormalAt(_p: Tuple, i: Intersection | null): Tuple {
    if (i == null) {
      return vector(0, 0, 0);
    }

    return add(
      add(
        multiplyTupleByScalar(this.n2, i.u),
        multiplyTupleByScalar(this.n3, i.v)
      ),
      multiplyTupleByScalar(this.n1, 1 - i.u - i.v)
    );
  }
}
