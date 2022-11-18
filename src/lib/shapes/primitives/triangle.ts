import { Intersection, intersection } from '../../intersections';
import { Ray } from '../../rays';
import { Tuple, subtract, normalize, cross, point, dot } from '../../tuples';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class Triangle extends Shape {
  e1: Tuple;
  e2: Tuple;
  normal: Tuple;

  private calculatedBounds: Bounds | null = null;

  constructor(public p1: Tuple, public p2: Tuple, public p3: Tuple) {
    super();
    this.e1 = subtract(p2, p1);
    this.e2 = subtract(p3, p1);
    this.normal = normalize(cross(this.e2, this.e1));
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
    return [intersection(t, this)];
  }

  protected localNormalAt(_p: Tuple): Tuple {
    return this.normal;
  }
}
